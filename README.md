![Tiktokenizer](https://user-images.githubusercontent.com/1443449/222597674-287aefdc-f0e1-491b-9bf9-16431b1b8054.svg)

***

# Tiktokenizer

Online playground for `openai/tiktoken`, calculating the correct number of tokens for a given prompt.

Special thanks to [Diagram](https://diagram.com/) for sponsorship and guidance.

https://user-images.githubusercontent.com/1443449/222598119-0a5a536e-6785-44ad-ba28-e26e04f15163.mp4

## Getting started

You can manually build `Tiktokenizer` using Docker:

```bash
echo "HF_API_KEY=<YOUR_API_KEY>" >> .env
docker compose -f docker/docker-compose.yml up -d
```

After execution you will be able to see working application at `localhost:3000`

## Acknowledgments

- [T3 Stack](https://create.t3.gg/)
- [shadcn/ui](https://github.com/shadcn/ui)
- [openai/tiktoken](https://github.com/openai/tiktoken)
