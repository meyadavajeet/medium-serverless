import { Hono } from 'hono'

const app = new Hono()

const api_version = "/api/v1";


app.get(`/`, (c) => {
  return c.text('Hello Hono! APP is UP and running !!!');
})

app.post(`${api_version}/signup`, (c) => {
  return c.text('Signup route')
});

app.post(`${api_version}/signin`, (c) => {
  return c.text('Signin route')
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
