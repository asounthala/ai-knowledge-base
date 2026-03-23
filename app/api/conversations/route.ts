import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma";

export async function GET() {
    const conversations = await prisma.conversation.findMany({
        orderBy: { createdAt: "desc" },
        include: { messages: { take: 1, orderBy: { createdAt: "asc"} } }
    });
    return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
    const { title } = await req.json();
    const conversation = await prisma.conversation.create({
        data: { title: title || "New Conversation"},
    });
    return NextResponse.json(conversation);
}
