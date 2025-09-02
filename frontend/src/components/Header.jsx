import { Link } from "react-router-dom";

export default function Header({ title = "Customers" }) {
  return (
    <div className="header-nav">
      <div className="container">
        <h2 className="header-title">
          <Link to="/" style={{ color: "inherit" }}>
            {title}
          </Link>
        </h2>
      </div>
    </div>
  );
}
