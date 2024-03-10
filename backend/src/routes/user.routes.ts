import { Hono } from 'hono';
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from 'hono/jwt'

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    },
    variables: {
        userId: string,
    }
}>();


userRouter.post('/api/v1/sign-up', async (c) => {
    console.log("sign-up route")
    const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate())

    // get body using hono
    const body = await c.req.json();
    console.log(body);

    try {
        const userExist = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        });
        if (!userExist) {
            const user = await prisma.user.create({
                data: {
                    email: body.email,
                    password: body.password
                }
            });

            const token = await sign({ id: user.id }, c.env.JWT_SECRET);
            return c.json({
                token: token
            })
        } else {
            c.status(422);
            return c.json({ message: "User already registered!!!" })
        }

    } catch (error) {
        console.log("err", error);
        c.status(500);
        return c.json({ error: error })
    }
});

userRouter.post(`/api/v1/sign-in`, async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    // const user = await prisma.user.findUnique({
    //   where: {
    //     email: body.email,
    //     password : body.password,
    //   }
    // });

    try {
        const user = await prisma.user.findFirst({
            where: {
                email: body.email,
                password: body.password,
            }
        });

        if (!user) {
            c.status(403);
            return c.json({ error: "user not found" });
        }
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    } catch (error) {
        console.log(error);
        c.status(403);
        return c.json({ error: "user not found" });
    }

})
