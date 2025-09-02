const express = require("express");
const db = require("../utils/db");
const {
  customerCreateSchema,
  customerUpdateSchema,
} = require("../validation/schemas");

const router = express.Router();

function mapCustomer(row) {
  if (!row) return null;
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    phone: row.phone,
    email: row.email,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

router.post("/", (req, res) => {
  const parsed = customerCreateSchema.parse(req.body);

  const insertCustomer = db.prepare(
    `INSERT INTO customers (first_name, last_name, phone, email) VALUES (?, ?, ?, ?)`
  );
  const result = insertCustomer.run(
    parsed.first_name,
    parsed.last_name,
    parsed.phone,
    parsed.email || null
  );

  const customerId = result.lastInsertRowid;

  if (parsed.address) {
    const insertAddress = db.prepare(
      `INSERT INTO addresses (customer_id, line1, line2, city, state, country, pincode, is_primary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    insertAddress.run(
      customerId,
      parsed.address.line1,
      parsed.address.line2 || null,
      parsed.address.city,
      parsed.address.state,
      parsed.address.country || "India",
      parsed.address.pincode,
      parsed.address.is_primary ? 1 : 0
    );
  }

  const created = db
    .prepare(`SELECT * FROM customers WHERE id = ?`)
    .get(customerId);
  res
    .status(201)
    .json({
      message: "Customer created successfully",
      data: mapCustomer(created),
    });
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = db.prepare(`SELECT * FROM customers WHERE id = ?`).get(id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  const addresses = db
    .prepare(
      `SELECT * FROM addresses WHERE customer_id = ? ORDER BY is_primary DESC, id ASC`
    )
    .all(id);
  res.json({ data: { ...mapCustomer(customer), addresses } });
});

router.get("/", (req, res) => {
  const {
    page = "1",
    pageSize = "10",
    sortBy = "created_at",
    sortOrder = "desc",
    city,
    state,
    pincode,
    q,
    onlyOneAddress,
    multiAddress,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const sizeNum = Math.min(100, Math.max(1, parseInt(pageSize)));
  const offset = (pageNum - 1) * sizeNum;

  const sortable = new Set(["created_at", "first_name", "last_name"]);
  const orderable = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";
  const sortColumn = sortable.has(sortBy) ? sortBy : "created_at";

  const where = [];
  const params = [];

  if (q) {
    where.push(
      `(c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)`
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (city) {
    where.push(
      `EXISTS (SELECT 1 FROM addresses a WHERE a.customer_id = c.id AND a.city = ?)`
    );
    params.push(city);
  }
  if (state) {
    where.push(
      `EXISTS (SELECT 1 FROM addresses a WHERE a.customer_id = c.id AND a.state = ?)`
    );
    params.push(state);
  }
  if (pincode) {
    where.push(
      `EXISTS (SELECT 1 FROM addresses a WHERE a.customer_id = c.id AND a.pincode = ?)`
    );
    params.push(pincode);
  }
  if (onlyOneAddress === "true") {
    where.push(
      `(SELECT COUNT(1) FROM addresses a WHERE a.customer_id = c.id) = 1`
    );
  }
  if (multiAddress === "true") {
    where.push(
      `(SELECT COUNT(1) FROM addresses a WHERE a.customer_id = c.id) > 1`
    );
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = db
    .prepare(`SELECT COUNT(1) as cnt FROM customers c ${whereSql}`)
    .get(...params).cnt;
  const rows = db
    .prepare(
      `SELECT c.* FROM customers c ${whereSql} ORDER BY c.${sortColumn} ${orderable} LIMIT ? OFFSET ?`
    )
    .all(...params, sizeNum, offset);

  res.json({
    data: rows.map(mapCustomer),
    page: pageNum,
    pageSize: sizeNum,
    total,
    totalPages: Math.ceil(total / sizeNum),
  });
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare(`SELECT * FROM customers WHERE id = ?`).get(id);
  if (!existing) return res.status(404).json({ error: "Customer not found" });

  const parsed = customerUpdateSchema.parse(req.body);
  const updates = [];
  const params = [];
  for (const key of ["first_name", "last_name", "phone", "email"]) {
    if (parsed[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(parsed[key]);
    }
  }
  if (updates.length === 0) return res.json({ message: "No changes" });

  const stmt = db.prepare(
    `UPDATE customers SET ${updates.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  );
  stmt.run(...params, id);
  const updated = db.prepare(`SELECT * FROM customers WHERE id = ?`).get(id);
  res.json({
    message: "Customer updated successfully",
    data: mapCustomer(updated),
  });
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const hasLinked = db
    .prepare(`SELECT COUNT(1) as cnt FROM addresses WHERE customer_id = ?`)
    .get(id).cnt;
  // For demo, allow deletion but confirm
  const info = db.prepare(`DELETE FROM customers WHERE id = ?`).run(id);
  if (info.changes === 0)
    return res.status(404).json({ error: "Customer not found" });
  res.json({
    message: `Customer deleted. Removed ${hasLinked} linked addresses.`,
  });
});

module.exports = router;
