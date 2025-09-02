const request = require("supertest");
const app = require("../src/server");
const db = require("../src/utils/db");

beforeAll(() => {
  // Fresh schema for in-memory db
  db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT DEFAULT 'India' NOT NULL,
    pincode TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
  );
  `);
});

afterAll(() => {
  db.close();
});

describe("Customers CRUD", () => {
  let createdId;

  test("create customer with address", async () => {
    const res = await request(app)
      .post("/api/customers")
      .send({
        first_name: "John",
        last_name: "Doe",
        phone: "9998887777",
        email: "john@example.com",
        address: {
          line1: "123 Main",
          city: "Pune",
          state: "MH",
          pincode: "411001",
          country: "India",
        },
      })
      .expect(201);

    expect(res.body.data).toHaveProperty("id");
    createdId = res.body.data.id;
  });

  test("read created customer", async () => {
    const res = await request(app)
      .get(`/api/customers/${createdId}`)
      .expect(200);
    expect(res.body.data.first_name).toBe("John");
    expect(Array.isArray(res.body.data.addresses)).toBe(true);
  });

  test("list customers with pagination", async () => {
    const res = await request(app)
      .get("/api/customers?page=1&pageSize=5")
      .expect(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("total");
  });

  test("update customer", async () => {
    const res = await request(app)
      .put(`/api/customers/${createdId}`)
      .send({ first_name: "Johnny" })
      .expect(200);
    expect(res.body.data.first_name).toBe("Johnny");
  });

  test("add additional address and query multi-address", async () => {
    await request(app)
      .post(`/api/addresses/${createdId}`)
      .send({
        line1: "456 Second",
        city: "Pune",
        state: "MH",
        pincode: "411002",
        country: "India",
      })
      .expect(201);

    const list = await request(app)
      .get("/api/customers?multiAddress=true")
      .expect(200);
    expect(list.body.data.some((c) => c.id === createdId)).toBe(true);
  });

  test("delete customer", async () => {
    await request(app).delete(`/api/customers/${createdId}`).expect(200);
    await request(app).get(`/api/customers/${createdId}`).expect(404);
  });
});
