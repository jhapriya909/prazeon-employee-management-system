import { useState } from "react";

function TaskComments({
  comments = [],
  onAddComment,
  loading = false,
}) {
  const [comment, setComment] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const value = comment.trim();

    if (!value) return;

    await onAddComment?.(value);
    setComment("");
  };

  return (
    <div>
      <div
        style={{
          maxHeight: "260px",
          overflowY: "auto",
          marginBottom: "18px",
        }}
      >
        {!comments.length ? (
          <p
            style={{
              padding: "24px",
              color: "#9296a8",
              textAlign: "center",
            }}
          >
            No comments yet.
          </p>
        ) : (
          comments.map((item, index) => (
            <div
              key={item._id || index}
              style={{
                display: "flex",
                gap: "11px",
                padding: "13px 0",
                borderBottom: "1px solid #edf0f6",
              }}
            >
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  borderRadius: "50%",
                  background: "#ebe8ff",
                  color: "#6557e8",
                  fontWeight: 700,
                }}
              >
                {(item.user?.name ||
                  item.author?.name ||
                  "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong
                  style={{
                    color: "#292d40",
                    fontSize: "13px",
                  }}
                >
                  {item.user?.name ||
                    item.author?.name ||
                    "User"}
                </strong>

                <p
                  style={{
                    margin: "5px 0",
                    color: "#606578",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  {item.message || item.comment || item.text}
                </p>

                <span
                  style={{
                    color: "#a0a4b4",
                    fontSize: "11px",
                  }}
                >
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : ""}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          type="text"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Write a comment..."
          style={{
            flex: 1,
            height: "43px",
            padding: "0 13px",
            border: "1px solid #e1e4ed",
            borderRadius: "9px",
            outline: "none",
          }}
        />

        <button
          type="submit"
          disabled={loading || !comment.trim()}
          style={{
            minWidth: "100px",
            height: "43px",
            border: "none",
            borderRadius: "9px",
            background: "#6557e8",
            color: "#ffffff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default TaskComments;
