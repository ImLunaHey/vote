FROM oven/bun

WORKDIR /app

COPY public /app/public
COPY src /app/src
COPY bun.lockb package.json tsconfig.json /app/

RUN bun i

CMD bun run start