"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Source {
	source: string;
	distance: number;
}

interface Message {
	role: "user" | "assistant";
	content: string;
	sources?: Source[];
}

interface Conversation {
	id: string;
	title: string;
	createdAt: string;
}

/*
  This component is used to render the content of a message, which may contain markdown formatting.
  It uses the ReactMarkdown library to parse and render the markdown content with custom styles.
*/
function MessageContent({ content }: { content: string }) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				h2: ({ children }) => (
					<h2 className="text-base font-bold mt-3 mb-1">{children}</h2>
				),
				h3: ({ children }) => (
					<h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>
				),
				p: ({ children }) => <p className="mb-2">{children}</p>,
				ul: ({ children }) => (
					<ul className="list-disc list-inside mb-2">{children}</ul>
				),
				ol: ({ children }) => (
					<ol className="list-decimal list-inside mb-2">{children}</ol>
				),
				li: ({ children }) => <li className="mb-1">{children}</li>,
				strong: ({ children }) => (
					<strong className="font-semibold">{children}</strong>
				),
				table: ({ children }) => (
					<table className="border-collapse text-xs my-2 w-full">
						{children}
					</table>
				),
				th: ({ children }) => (
					<th className="border border-white/20 px-2 py-1 text-left">
						{children}
					</th>
				),
				td: ({ children }) => (
					<td className="border border-white/20 px-2 py-1">{children}</td>
				),
			}}
		>
			{content}
		</ReactMarkdown>
	);
}

export default function ChatPage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [conversations, setConversations] = useState<Conversation[]>([]);

	// Load conversation list on mount
	useEffect(() => {
		fetch(`/api/conversations`)
			.then((r) => r.json())
			.then(setConversations);
	}, []);

	async function loadConversation(id: string) {
		const res = await fetch(`/api/conversations/${id}`);
		const data = await res.json();
		console.log("Loaded conversations: ", data);
		setConversationId(id);
		setMessages(
			data.messages.map(
				(m: { role: string; content: string; sources: string }) => ({
					role: m.role,
					content: m.content,
					sources: JSON.parse(m.sources ?? "[]"),
				}),
			),
		);
	}

	function startNewConversation() {
		setConversationId(null);
		setMessages([]);
	}

	async function deleteConversation(id: string, e: React.MouseEvent) {
	e.stopPropagation(); // prevent triggering loadConversation
	await fetch(`/api/conversations/${id}`, { method: "DELETE" });
		setConversations((prev) => prev.filter((c) => c.id !== id));
		if (conversationId === id) {
			setConversationId(null);
			setMessages([]);
		}
	}

	async function sendMessage() {
		if (!input.trim() || loading) return;

		const question = input.trim();
		setInput("");

		const userMessage: Message = { role: "user", content: question };
		setMessages((prev) => [...prev, userMessage]);
		setLoading(true);

		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question, conversationId }),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error);

			// Track conversation id from first message
			if (!conversationId) {
				setConversationId(data.conversationId);
				// Refresh conversation list
				fetch("/api/conversations")
					.then((r) => r.json())
					.then(setConversations);
			}

			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: data.answer,
					sources: data.sources,
				},
			]);
		} catch (err: unknown) {
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
				},
			]);
		} finally {
			setLoading(false);
		}
	}

	return (
			<main className="flex flex-1 overflow-hidden">
				{/* Conversation List */}
				<div className="w-64 border-r border-white/10 flex flex-col p-4 gap-2 overflow-y-auto">
					<button
						onClick={startNewConversation}
						className="w-full text-sm bg-accent hover:bg-accent/80 text-white rounded-lg px-3 py-2 font-semibold transition-colors cursor-pointer"
					>
						+ New Chat
					</button>

					{conversations.map((c) => (
						<div
							key={c.id}
							className={`group flex items-center justify-between rounded-lg transition-colors ${
								c.id === conversationId ? "bg-accent/20" : "hover:bg-white/5"
							}`}
						>
							<button
								onClick={() => loadConversation(c.id)}
								className={`flex-1 text-left text-xs px-3 py-2 truncate ${
									c.id === conversationId ? "text-accent" : "text-muted"
								}`}
							>
								{c.title}
							</button>
							<button
								onClick={(e) => deleteConversation(c.id, e)}
								className="opacity-0 group-hover:opacity-100 pr-2 text-muted hover:text-red-400 transition-all text-xs"
							>
								✕
							</button>
						</div>
					))}
				</div>

				{/* Chat Area */}
				<div className="flex flex-1 flex-col p-6 overflow-hidden">
					<h1 className="text-2xl font-bold mb-6">
						Chat with your <span className="text-accent">documents</span>
					</h1>

					<div className="flex-1 overflow-y-auto flex flex-col gap-4 mb-4">
						{messages.length === 0 && (
							<p className="text-muted text-sm text-center mt-12">
								Upload a document on the home page, then ask anything about it.
							</p>
						)}

						{messages.map((msg, i) => (
							<div
								key={i}
								className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
							>
								<div
									className={`max-w-2xl px-4 py-3 rounded-xl text-sm leading-relaxed ${
										msg.role === "user"
											? "bg-accent text-white"
											: "bg-white/5 text-text"
									}`}
								>
									{msg.role === "assistant" ? (
										<MessageContent content={msg.content} />
									) : (
										msg.content
									)}
								</div>

								{msg.sources && msg.sources.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-1 max-w-2xl">
										{msg.sources.map((s, j) => (
											<span
												key={j}
												className="text-xs font-mono bg-white/5 border border-white/10 rounded px-2 py-1 text-muted"
											>
												[{j + 1}] {s.source}
											</span>
										))}
									</div>
								)}
							</div>
						))}

						{loading && (
							<div className="flex items-start">
								<div className="bg-white/5 px-4 py-3 rounded-xl text-sm text-muted animate-pulse">
									Thinking...
								</div>
							</div>
						)}
					</div>

					<div className="flex gap-3">
						<input
							className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
							placeholder="Ask something about your documents..."
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && sendMessage()}
							disabled={loading}
						/>
						<button
							onClick={sendMessage}
							disabled={loading}
							className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
						>
							Send
						</button>
					</div>
				</div>
			</main>
	);
}
