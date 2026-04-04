import { createPortal } from "react-dom";
import { usePanelTransition } from "../contexts/PanelTransitionContext";

export default function PanelTransitionOverlay() {
  const { isTransitioning } = usePanelTransition();

  if (!isTransitioning) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#050818",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      data-ocid="panel_transition.modal"
    >
      <video
        src="/assets/transition.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          maxWidth: "100vw",
          maxHeight: "100vh",
          objectFit: "contain",
        }}
      />
    </div>,
    document.body,
  );
}
