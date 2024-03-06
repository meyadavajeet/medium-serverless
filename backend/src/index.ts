import { Hono } from 'hono';
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from 'hono/jwt'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string,

  }
}>();

const api_version = "/api/v1";


app.get(`/`, async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  return c.text('Hello Hono! APP is UP and running !!!');
})

app.post(`${api_version}/sign-up`, async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  // get body using hono
  const body = await c.req.json();
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password
      }
    });

    const token = sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({
      token: token
    })
  } catch (error) {
    return c.status(403);
  }
});

app.post(`${api_version}/sign-in`, async (c) => {
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


app.get(`${api_version}/blog`, (c) => {
  return c.text('blog route')
})


app.get(`${api_version}/blog/:id`, (c) => {
  const id = c.req.param(`id`);
  console.log(id)
  return c.text('get blog by id route')
})

app.post(`${api_version}/blog`, (c) => {
  return c.text(`blog post route`)
})

app.put(`${api_version}/blog`, (c) => {
  return c.text(`blog update route`)
})

app.delete(`${api_version}/blog/:id`, (c) => {
  return c.text(`blog delete route`)
})



export default app
