import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    DATABASE_URL: string;
    NATS_SERVERS: string[];
}

const envSchema = joi.object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    NATS_SERVERS: joi.array().items( joi.string() ).required()
})
.unknown(true);

const { error, value } = envSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if ( error ) throw new Error(`Config validation error: ${ error.message }`);

const envVars: EnvVars = value;

export const envs = {
    PORT: envVars.PORT,
    DATABASE_URL: envVars.DATABASE_URL,
    natsServers: envVars.NATS_SERVERS
}