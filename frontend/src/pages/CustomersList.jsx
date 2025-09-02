import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "https://crud-5twl.onrender.com/api";

export default function CustomersList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    data: [],
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 10);
  const sortBy = searchParams.get("sortBy") || "created_at";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const q = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";
  const pincode = searchParams.get("pincode") || "";
  const onlyOneAddress = searchParams.get("onlyOneAddress") || "";
  const multiAddress = searchParams.get("multiAddress") || "";

  const params = useMemo(
    () => ({
      page,
      pageSize,
      sortBy,
      sortOrder,
      q,
      city,
      state,
      pincode,
      onlyOneAddress,
      multiAddress,
    }),
    [
      page,
      pageSize,
      sortBy,
      sortOrder,
      q,
      city,
      state,
      pincode,
      onlyOneAddress,
      multiAddress,
    ]
  );

  useEffect(() => {
    setLoading(true);
    setError("");
    axios
      .get(`${API}/customers`, { params })
      .then((res) => setData(res.data))
      .catch((e) => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, [params]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  function clearFilters() {
    const next = new URLSearchParams();
    next.set("page", "1");
    next.set("pageSize", String(pageSize));
    next.set("sortBy", sortBy);
    next.set("sortOrder", sortOrder);
    setSearchParams(next);
  }

  return (
    <>
      <Header title="Customers" />
      <div className="container">
        <header className="toolbar">
          <div className="toolbar-actions">
            <Link to="/customers/new" className="btn primary">
              New Customer
            </Link>
          </div>
        </header>

        <section className="filters">
          <input
            placeholder="Search name/phone/email"
            value={q}
            onChange={(e) => updateParam("q", e.target.value)}
          />
          <input
            placeholder="City"
            value={city}
            onChange={(e) => updateParam("city", e.target.value)}
          />
          <input
            placeholder="State"
            value={state}
            onChange={(e) => updateParam("state", e.target.value)}
          />
          <input
            placeholder="Pincode"
            value={pincode}
            onChange={(e) => updateParam("pincode", e.target.value)}
          />
          <label>
            <input
              type="checkbox"
              checked={onlyOneAddress === "true"}
              onChange={(e) =>
                updateParam("onlyOneAddress", e.target.checked ? "true" : "")
              }
            />
            Only one address
          </label>
          <label>
            <input
              type="checkbox"
              checked={multiAddress === "true"}
              onChange={(e) =>
                updateParam("multiAddress", e.target.checked ? "true" : "")
              }
            />
            Multiple addresses
          </label>
          <button className="btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </section>

        <section className="list">
          {loading && <div className="info">Loading...</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && (
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <button
                      className="link"
                      onClick={() => updateParam("sortBy", "first_name")}
                    >
                      Name
                    </button>
                  </th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>
                    <button
                      className="link"
                      onClick={() => updateParam("sortBy", "created_at")}
                    >
                      Created
                    </button>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.first_name} {c.last_name}
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.email || "-"}</td>
                    <td>{new Date(c.created_at).toLocaleString()}</td>
                    <td>
                      <Link to={`/customers/${c.id}`} className="btn small">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <footer className="pagination">
          <button
            className="btn"
            disabled={page <= 1}
            onClick={() => updateParam("page", String(page - 1))}
          >
            Prev
          </button>
          <span>
            Page {page} / {data.totalPages || 1}
          </span>
          <button
            className="btn"
            disabled={page >= (data.totalPages || 1)}
            onClick={() => updateParam("page", String(page + 1))}
          >
            Next
          </button>
          <select
            value={sortOrder}
            onChange={(e) => updateParam("sortOrder", e.target.value)}
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </footer>
      </div>
    </>
  );
}
