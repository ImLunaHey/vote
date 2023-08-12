import { fileURLToPath } from 'url';
import { join } from 'path';
import { HttpError, createApplication } from '@nbit/bun';
import { AnyZodObject } from 'zod';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const { defineRoutes, attachRoutes, createRequestHandler } = createApplication({
    root: join(__dirname, '..'),
    allowStaticFrom: ['public'],
    getContext(request) {
        return {
            async validate(schema: AnyZodObject) {
                try {
                    const body = await request.json();
                    const query = new URL(request.url).searchParams;
                    console.log({
                        body,
                        query,
                        url: request.url,
                    })
                    return await schema.parseAsync({
                        body,
                        // params,
                    });
                } catch (error: unknown) {
                    console.error('Failed validating request', { error });
                    throw new HttpError({ status: 400, message: (error as Error).message });
                }
            }
        }
    }
});

export { defineRoutes, attachRoutes, createRequestHandler };
