import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/exams")
      .then((r) => r.json())
      .then(setExams)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2>Available Exams</h2>
      <ul>
        {exams.map((e) => (
          <li key={e._id}>
            <strong>{e.title}</strong>
            {e.category ? (
              <span>
                {" "}
                -{" "}
                <a href={`/category/${encodeURIComponent(e.category)}`}>
                  {e.category}
                </a>
              </span>
            ) : null}{" "}
            - {e.description || ""} <a href={`/exam/${e._id}`}>Take</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
