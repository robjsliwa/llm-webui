import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import breaks from "remark-breaks";
import remarkGfm from "remark-gfm";

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

  const sendMessage = async () => {
    const prompt = `Below is an instruction that describes a task. Write a response that appropriately completes the request.\n\n### Instructions: ${input}\n\n### Response:\n`;
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
      let isFirstIteration = true;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const result = decoder.decode(value);
        // console.log(result);
        try {
          answer += JSON.parse(result.slice(5)).choices[0].text;
        } catch {
          console.log("error", result);
        }

        // escape ordered list that gets removed by markdown
        answer = answer.replace(/(\d+)\./g, "\n$1) ");

        if (messages.length > 0 && !isFirstIteration) {
          messages[messages.length - 1].text = answer;
          setMessages([...messages]);
        } else {
          setMessages([
            ...messages,
            { sender: "user", text: input },
            { sender: "bot", text: answer },
          ]);
          isFirstIteration = false;
        }
      }

      // const answer = JSON.parse(result).choices[0].text;
      setLoading(false);
      // setMessages([
      //   ...messages,
      //   { sender: "user", text: input },
      //   { sender: "bot", text: res },
      // ]);
    }
  };

  return (
    <div className="flex flex-col h-screen p-6 bg-gray-800 text-white">
      <h1 className="text-4xl font-bold mb-4">ChatGPT Demo</h1>
      <div className="overflow-y-auto mb-4 flex-grow border border-gray-700 p-4 bg-gray-900">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded ${
              message.sender === "user" ? "bg-blue-500" : "bg-green-500"
            }`}
          >
            <strong className="font-bold">{message.sender}:</strong>
            {message.sender === "bot" ? (
              <ReactMarkdown children={message.text} />
            ) : (
              <p>{message.text}</p>
            )}
          </div>
        ))}
      </div>
      <textarea
        className="w-full h-20 p-2 mb-2 border border-gray-700 bg-gray-900 text-white"
        onChange={handleInput}
        value={input}
        disabled={isLoading}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={sendMessage}
        disabled={isLoading}
      >
        Send
      </button>
    </div>
  );
};

export default App;
