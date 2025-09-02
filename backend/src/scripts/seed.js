const db = require("../utils/db");

function runSeed() {
  const customers = [
    {
      first_name: "Aarav",
      last_name: "Sharma",
      phone: "9000000001",
      email: "aarav@example.com",
      addr: {
        line1: "12 MG Road",
        city: "Bengaluru",
        state: "KA",
        pincode: "560001",
        country: "India",
      },
    },
    {
      first_name: "Priya",
      last_name: "Mehta",
      phone: "9000000002",
      email: "priya@example.com",
      addr: {
        line1: "221B Baker St",
        city: "Mumbai",
        state: "MH",
        pincode: "400001",
        country: "India",
      },
    },
    {
      first_name: "Rahul",
      last_name: "Verma",
      phone: "9000000003",
      email: "rahul@example.com",
      addr: {
        line1: "45 Park Ave",
        city: "Pune",
        state: "MH",
        pincode: "411001",
        country: "India",
      },
    },
    {
      first_name: "Sneha",
      last_name: "Iyer",
      phone: "9000000004",
      email: "sneha@example.com",
      addr: {
        line1: "7 Beach Road",
        city: "Chennai",
        state: "TN",
        pincode: "600001",
        country: "India",
      },
    },
    {
      first_name: "Vikram",
      last_name: "Singh",
      phone: "9000000005",
      email: "vikram@example.com",
      addr: {
        line1: "89 Lake View",
        city: "Delhi",
        state: "DL",
        pincode: "110001",
        country: "India",
      },
    },
    {
      first_name: "Neha",
      last_name: "Kapoor",
      phone: "9000000006",
      email: "neha@example.com",
      addr: {
        line1: "3 Green Park",
        city: "Jaipur",
        state: "RJ",
        pincode: "302001",
        country: "India",
      },
    },
  ];

  const insertCustomer = db.prepare(
    `INSERT INTO customers (first_name, last_name, phone, email) VALUES (?, ?, ?, ?)`
  );
  const insertAddress = db.prepare(
    `INSERT INTO addresses (customer_id, line1, line2, city, state, country, pincode, is_primary)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
  );

  const transaction = db.transaction(() => {
    for (const c of customers) {
      const existing = db
        .prepare(`SELECT id FROM customers WHERE phone = ?`)
        .get(c.phone);
      let customerId;
      if (existing) {
        customerId = existing.id;
      } else {
        const res = insertCustomer.run(
          c.first_name,
          c.last_name,
          c.phone,
          c.email
        );
        customerId = res.lastInsertRowid;
      }
      insertAddress.run(
        customerId,
        c.addr.line1,
        null,
        c.addr.city,
        c.addr.state,
        c.addr.country,
        c.addr.pincode
      );
    }
  });

  transaction();
  console.log("Seeded 6 customers with addresses");
}

runSeed();
