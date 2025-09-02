import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "https://crud-5twl.onrender.com/api";

export default function CustomerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    },
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEdit) {
      axios.get(`${API}/customers/${id}`).then((res) => {
        const c = res.data.data;
        setForm({
          first_name: c.first_name,
          last_name: c.last_name,
          phone: c.phone,
          email: c.email || "",
          address: c.addresses?.[0]
            ? {
                line1: c.addresses[0].line1 || "",
                line2: c.addresses[0].line2 || "",
                city: c.addresses[0].city || "",
                state: c.addresses[0].state || "",
                country: c.addresses[0].country || "India",
                pincode: c.addresses[0].pincode || "",
              }
            : {
                line1: "",
                line2: "",
                city: "",
                state: "",
                country: "India",
                pincode: "",
              },
        });
      });
    }
  }, [isEdit, id]);

  function onChange(e) {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((f) => ({ ...f, address: { ...f.address, [key]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (isEdit) {
        await axios.put(`${API}/customers/${id}`, {
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          email: form.email || undefined,
        });
        setSuccess("Customer updated successfully");
        navigate(`/customers/${id}`);
      } else {
        const res = await axios.post(`${API}/customers`, form);
        setSuccess("Customer created successfully");
        navigate(`/customers/${res.data.data.id}`);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Validation failed");
    }
  }

  return (
    <>
      <Header title={isEdit ? "Edit Customer" : "New Customer"} />
      <div className="container">
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <form className="form" onSubmit={onSubmit}>
          <div className="grid">
            <label>
              First Name
              <input
                name="first_name"
                value={form.first_name}
                onChange={onChange}
                required
                minLength={2}
              />
            </label>
            <label>
              Last Name
              <input
                name="last_name"
                value={form.last_name}
                onChange={onChange}
                required
                minLength={2}
              />
            </label>
            <label>
              Phone
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                required
                pattern="[0-9]{10}"
              />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
              />
            </label>
          </div>
          {!isEdit && (
            <fieldset>
              <legend>Primary Address</legend>
              <div className="grid">
                <label>
                  Line 1
                  <input
                    name="address.line1"
                    value={form.address.line1}
                    onChange={onChange}
                    required
                  />
                </label>
                <label>
                  Line 2
                  <input
                    name="address.line2"
                    value={form.address.line2}
                    onChange={onChange}
                  />
                </label>
                <label>
                  City
                  <input
                    name="address.city"
                    value={form.address.city}
                    onChange={onChange}
                    required
                  />
                </label>
                <label>
                  State
                  <input
                    name="address.state"
                    value={form.address.state}
                    onChange={onChange}
                    required
                  />
                </label>
                <label>
                  Country
                  <input
                    name="address.country"
                    value={form.address.country}
                    onChange={onChange}
                  />
                </label>
                <label>
                  Pincode
                  <input
                    name="address.pincode"
                    value={form.address.pincode}
                    onChange={onChange}
                    required
                    pattern="[1-9][0-9]{5}"
                  />
                </label>
              </div>
            </fieldset>
          )}
          <div className="actions">
            <button className="btn primary" type="submit">
              {isEdit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
