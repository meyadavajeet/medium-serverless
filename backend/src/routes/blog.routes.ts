import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

/**
 * Middleware for the blog post routes
 */
blogRouter.use(`/*`, async (c, next) => {
  const jwt = c.req.header("Authorization") || "";
  if (!jwt) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  const token = jwt.split(" ")[1];
  const payload = await verify(token, c.env.JWT_SECRET);
  if (!payload) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  c.set("userId", payload.id);
  await next();
});

blogRouter.get(`/blog`, async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();
    const userId = c.get("userId");
    const blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
    });
    c.status(201);
    return c.json({
      message: "Blog created Successfully!!",
      data: blog.id,
    });
  } catch (error) {
    console.log(error);
    c.status(500);
    return c.json({ error: error });
  }
});

blogRouter.post(`/bulk`, async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const userId = c.get("userId");
    const post = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
    });
    c.status(200);
    return c.json({
      data: post,
    });
  } catch (error) {
    console.log(error);
    c.status(500);
    c.json({
      message: "Some error while getting posts",
    });
  }
});

blogRouter.get(`/:id`, async (c) => {
  const id = c.req.param(`id`);
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const post = await prisma.post.findUnique({
      where: {
        authorId: userId,
        id: id,
      },
    });
    c.status(200);
    c.json({
      message: "Fetched successfully!!",
      data: post,
    });
    return;
  } catch (error) {
    console.log(error);
    c.status(500);
    c.json({
      message: "Some error while getting posts by id",
    });
  }
});

blogRouter.put(`/blog`, async (c) => {
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();

  try {
    const post = prisma.post.update({
      where: {
        id: body.id,
        authorId: userId,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    c.status(200);
    c.json({
      data: post,
    });
  } catch (error) {
    console.log(error);
    c.status(500);
    c.json({
      message: "Some error while updating the post",
    });
  }
});

blogRouter.delete(`/:id`, async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const post = await prisma.post.delete({
      where: {
        id: id,
      },
    });
    c.status(200);
    return c.json({
      data: post,
    });
  } catch (error) {
    console.log(error);
    c.status(500);
    c.json({
      message: "Some error while updating the post",
    });
  }
});
