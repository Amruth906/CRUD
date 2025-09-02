const express = require("express");
const db = require("../utils/db");
const {
  addressInputSchema,
  addressUpdateSchema,
} = require("../validation/schemas");

const router = express.Router();

router.get("/", (req, res) => {
  const { customer_id, city, state, pincode } = req.query;
  const where = [];
  const params = [];
  if (customer_id) {
    where.push("customer_id = ?");
    params.push(Number(customer_id));
  }
  if (city) {
    where.push("city = ?");
    params.push(city);
  }
  if (state) {
    where.push("state = ?");
    params.push(state);
  }
  if (pincode) {
    where.push("pincode = ?");
    params.push(pincode);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = db
    .prepare(
      `SELECT * FROM addresses ${whereSql} ORDER BY is_primary DESC, id DESC`
    )
    .all(...params);
  res.json({ data: rows });
});

router.post("/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const customer = db
    .prepare(`SELECT id FROM customers WHERE id = ?`)
    .get(customerId);
  if (!customer)
    return res
      .status(404)
      .json({ error: "Customer not found", message: "Customer not found" });
  const parsed = addressInputSchema.parse(req.body);

  const insert = db.prepare(
    `INSERT INTO addresses (customer_id, line1, line2, city, state, country, pincode, is_primary)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const result = insert.run(
    customerId,
    parsed.line1,
    parsed.line2 || null,
    parsed.city,
    parsed.state,
    parsed.country || "India",
    parsed.pincode,
    parsed.is_primary ? 1 : 0
  );
  res
    .status(201)
    .json({ message: "Address added", id: result.lastInsertRowid });
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare(`SELECT * FROM addresses WHERE id = ?`).get(id);
  if (!existing)
    return res
      .status(404)
      .json({ error: "Address not found", message: "Address not found" });
  const parsed = addressUpdateSchema.parse(req.body);
  const updates = [];
  const params = [];
  for (const key of ["line1", "line2", "city", "state", "country", "pincode"]) {
    if (parsed[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(parsed[key]);
    }
  }
  if (parsed.is_primary !== undefined) {
    updates.push(`is_primary = ?`);
    params.push(parsed.is_primary ? 1 : 0);
  }
  if (updates.length === 0) return res.json({ message: "No changes" });

  const stmt = db.prepare(
    `UPDATE addresses SET ${updates.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  );
  stmt.run(...params, id);
  const updated = db.prepare(`SELECT * FROM addresses WHERE id = ?`).get(id);
  res.json({ message: "Address updated", data: updated });
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare(`DELETE FROM addresses WHERE id = ?`).run(id);
  if (info.changes === 0)
    return res
      .status(404)
      .json({ error: "Address not found", message: "Address not found" });
  res.json({ message: "Address deleted" });
});

module.exports = router;
