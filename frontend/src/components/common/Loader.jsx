function Loader({ text = "Loading..." }) {
  return (
    <div
      style={{
        minHeight: "180px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        color: "#73788c",
      }}
    >
      <div
        style={{
          width: "38px",
          height: "38px",
          border: "4px solid #e5e7f8",
          borderTopColor: "#6557e8",
          borderRadius: "50%",
          animation: "loaderSpin 0.8s linear infinite",
        }}
      />

      <span>{text}</span>

      <style>
        {`
          @keyframes loaderSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

export default Loader;
