import { Hono } from 'hono';
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from 'hono/jwt'

export const blogRouter = new Hono<{
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
blogRouter.use(`/*`, async (c, next) => {
    const jwt = c.req.header("Authorization");
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
    // c.set('userId', payload.id);
    await next();
  });

blogRouter.get(`/api/v1/blog`, (c) => {
    return c.text('blog route')
})

blogRouter.get(`/api/v1/blog/:id`, (c) => {
    const id = c.req.param(`id`);
    console.log(id)
    return c.text('get blog by id route')
})

blogRouter.post(`/api/v1/blog`, (c) => {
    return c.text(`blog post route`)
})

blogRouter.put(`/api/v1/blog`, (c) => {
    return c.text(`blog update route`)
})

blogRouter.delete(`/api/v1/blog/:id`, (c) => {
    return c.text(`blog delete route`)
});
