import React, { useState } from "react";

type Message = {
  sender: "user" | "bot";
  text: string;
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setLoading] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const sendMessageStreamResponse = async () => {
    const prompt = `\n\n### Instructions: ${input}\n\n### Response:\n`;
    // setMessages([
    //   ...messages,
    //   { sender: "user", text: input },
    //   { sender: "bot", text: "" },
    // ]);
    setInput("");
    setLoading(true);

    const response = await fetch("http://localhost:8000/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, max_tokens: 1800, stream: true }),
    });

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const result = decoder.decode(value);
        console.log(result);
        try {
          answer += JSON.parse(result.slice(5)).choices[0].text;
        } catch {
          console.log("error", result);
        }

        if (messages.length > 0) {
          messages[messages.length - 1].text = answer;
          setMessages([...messages]);
        } else {
          setMessages([
            ...messages,
            { sender: "user", text: input },
            { sender: "bot", text: answer },
          ]);
        }
        // console.log(messages[messages.length - 1]);
        // messages[messages.length - 1].text = answer;
        // setMessages([...messages]);
      }

      // const answer = JSON.parse(result).choices[0].text;
      setLoading(false);
      // setMessages([
      //   ...messages,
      //   { sender: "user", text: input },
      //   { sender: "bot", text: answer },
      // ]);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">LLama Chat</h1>
      <div className="overflow-y-auto h-64 mb-4 border p-4">
        {messages.map((message, index) => (
          <p key={index} className="mb-2">
            <strong className="font-bold">{message.sender}:</strong>{" "}
            {message.text}
          </p>
        ))}
      </div>
      <textarea
        className="w-full h-20 p-2 mb-2 border"
        onChange={handleInput}
        value={input}
        disabled={isLoading}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={sendMessageStreamResponse}
        disabled={isLoading}
      >
        Send
      </button>
    </div>
  );
};

export default App;
