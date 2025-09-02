import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [addrForm, setAddrForm] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });

  function load() {
    setError("");
    axios
      .get(`${API}/customers/${id}`)
      .then((res) => setData(res.data.data))
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
  }, [id]);

  async function onAddAddress(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API}/addresses/${id}`, addrForm);
      setAddrForm({
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
      });
      setSuccess("Address added");
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to add address");
    }
  }

  async function onDeleteCustomer() {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    await axios.delete(`${API}/customers/${id}`);
    navigate("/");
  }

  async function onDeleteAddress(addrId) {
    if (!confirm("Delete this address?")) return;
    await axios.delete(`${API}/addresses/${addrId}`);
    load();
  }

  return (
    <>
      <Header title="Customer Profile" />
      <div className="container">
        {!data ? (
          <div>Loading...</div>
        ) : (
          <>
            <header className="toolbar">
              <div className="toolbar-actions">
                <Link className="btn" to={`/customers/${id}/edit`}>
                  Edit
                </Link>
                <button className="btn danger" onClick={onDeleteCustomer}>
                  Delete
                </button>
                <Link className="btn" to="/">
                  Back
                </Link>
              </div>
            </header>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <section className="cards">
              <div className="card">
                <h3>Contact</h3>
                <p>Phone: {data.phone}</p>
                <p>Email: {data.email || "-"}</p>
                <p>
                  Addresses: {data.addresses?.length || 0}{" "}
                  {data.addresses?.length === 1 ? "(Only One Address)" : ""}
                </p>
              </div>
              <div className="card">
                <h3>Add Address</h3>
                <form onSubmit={onAddAddress} className="grid">
                  <input
                    placeholder="Line 1"
                    value={addrForm.line1}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, line1: e.target.value })
                    }
                    required
                  />
                  <input
                    placeholder="Line 2"
                    value={addrForm.line2}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, line2: e.target.value })
                    }
                  />
                  <input
                    placeholder="City"
                    value={addrForm.city}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, city: e.target.value })
                    }
                    required
                  />
                  <input
                    placeholder="State"
                    value={addrForm.state}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, state: e.target.value })
                    }
                    required
                  />
                  <input
                    placeholder="Country"
                    value={addrForm.country}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, country: e.target.value })
                    }
                  />
                  <input
                    placeholder="Pincode"
                    value={addrForm.pincode}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, pincode: e.target.value })
                    }
                    required
                    pattern="[1-9][0-9]{5}"
                  />
                  <div className="actions">
                    <button className="btn primary">Add</button>
                  </div>
                </form>
              </div>
            </section>

            <section>
              <h3>Addresses</h3>
              {!data.addresses?.length ? (
                <div className="info">No addresses</div>
              ) : (
                <ul className="list-plain">
                  {data.addresses.map((a) => (
                    <li key={a.id} className="list-item">
                      <div>
                        <div>
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ""}
                        </div>
                        <div>
                          {a.city}, {a.state}, {a.country} - {a.pincode}
                        </div>
                      </div>
                      <div>
                        <button
                          className="btn danger small"
                          onClick={() => onDeleteAddress(a.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
