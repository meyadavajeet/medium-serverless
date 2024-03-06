import { Hono } from 'hono';
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from 'hono/jwt'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string,
  },
  variables: {
    userId: string,
  }
}>();

/**
 * Middleware for the blog post routes
 */
app.use(`/api/v1/blog/*`, async (c, next) => {
  const jwt = c.req.header('Authorization');
  if (!jwt) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  const token = jwt.split(' ')[1];
  const payload = await verify(token, c.env.JWT_SECRET);
  if (!payload) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  // c.set('userId', payload.id);
  await next();
})


app.get(`/`, async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  return c.text('Hello Hono! APP is UP and running !!!');
})

app.post('/api/v1/sign-up', async (c) => {
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

app.post(`/api/v1/sign-in`, async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const user = await prisma.user.findUnique({
    where: {
      email: body.email
    }
  });
  if (!user) {
    c.status(403);
    return c.json({ error: "user not found" });
  }
  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
  return c.json({ jwt });
})


app.get(`/api/v1/blog`, (c) => {
  return c.text('blog route')
})


app.get(`/api/v1/blog/:id`, (c) => {
  const id = c.req.param(`id`);
  console.log(id)
  return c.text('get blog by id route')
})

app.post(`/api/v1/blog`, (c) => {
  return c.text(`blog post route`)
})

app.put(`/api/v1/blog`, (c) => {
  return c.text(`blog update route`)
})

app.delete(`/api/v1/blog/:id`, (c) => {
  return c.text(`blog delete route`)
})



export default app
