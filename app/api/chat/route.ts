import { NextRequest, NextResponse } from "next/server";
import { queryDocuments } from "@/lib/query";
import { prisma } from "@/lib/prisma"
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";


const model = new ChatAnthropic({
    model: "claude-sonnet-4-6",
    maxTokens: 1024,
});

export async function POST(req: NextRequest) {
    try {
        const { question, conversationId } = await req.json();

        if (!question) {
            return NextResponse.json({ error: "Question is required" }, { status: 400 });
        }

        // Load conversation history from DB
        let conversation = conversationId
            ? await prisma.conversation.findUnique({
                where: { id: conversationId },
                include: { messages: { orderBy: { createdAt: "asc" } } }
            })
            : null;

        // Create a new conversation if none exists
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: { title: question.slice(0, 50) },
                include: { messages: true },
            });
        }

        // 1. RETRIEVE
        const relevantChunks = await queryDocuments(question);

        // 2. AUGMENT
        const context = relevantChunks
            .map((r, i) => `[${i + 1}] (from: ${r.source})\n${r.text}`)
            .join("\n\n");

        // 3. BUILD MESSAGES
        const systemMessage = new SystemMessage(
            "You are a helpful assistant that answers questions based on the provided document context. " +
            "Only use the information from the context to answer. If the answer is not in the context, say so honestly. " +
            "Always cite which source number(s) you used, e.g. [1], [2]."
        );

        const historyMessages = conversation.messages.map((m) =>
            m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
        );

        const userMessage = new HumanMessage(
            `Context:\n${context}\n\nQuestion: ${question}`
        );

        // 4. GENERATE
        const response = await model.invoke([
            systemMessage,
            ...historyMessages,
            userMessage,
        ]);

        const answer = typeof response.content === "string"
            ? response.content
            : response.content.map((c: { type: string; text?: string }) =>
                c.type === "text" ? c.text : ""
            ).join("");

        const sources = relevantChunks.map((r) => ({ source: r.source }));

        // 5. SAVE both messages to DB
        await prisma.message.createMany({
            data: [
                {
                    conversationId: conversation.id,
                    role: "user",
                    content: question,
                    sources: "[]"
                },
                {
                    conversationId: conversation.id,
                    role: "assistant",
                    content: answer,
                    sources: JSON.stringify(sources),
                }
            ],
        });

        return NextResponse.json({
            answer,
            sources,
            conversationId: conversation.id,
        });

    } catch (error: unknown) {
        console.error("Error handling chat request:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Internal Server Error" },
            { status: 500 }
        );
    }
}