# llm-webui

Is a simple, fun project to run your own LLM chat using llama.cpp.

## How to run

1. Clone the repo: https://github.com/robjsliwa/llama-cpp-python for Python bindings for llama.cpp
2. If you want to get latest version of llama.cpp, go to `vendor` folder and run git clone https://github.com/ggerganov/llama.cpp in there or update the hash whatever is easier for you.
3. Build docker image: `docker build -t llama-server .`
4. Run it with: `docker run --rm -it -p 8000:8000 -v /home/data/datasets/wizard-vicuna:/models -e MODEL=/models/Wizard-Vicuna-13B-Uncensored.ggml.q8_0.bin llama-server`
5. Install web ui with: `npm install`
6. Start web ui with: `npm start`

**Note**: You can find great models on Hugging Face here: https://huggingface.co/TheBloke/Wizard-Vicuna-13B-Uncensored-GGML/tree/main
