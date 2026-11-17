import type { Brush } from "./brush";
export function skillIcon(b: Brush, kind: string, cx: number, cy: number, r: number): void {
  const c = b.ctx;
  c.save();
  c.translate(cx, cy);
  c.scale(r / 40, r / 40);
  c.lineWidth = 3.4;
  c.strokeStyle = b.palette.highlight;
  c.fillStyle = b.palette.highlight;
  c.lineCap = "round";
  c.lineJoin = "round";
  const path = (points: number[][]) => {
    c.beginPath();
    points.forEach(([x, y], i) => {
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    });
    c.stroke();
  };
  if (kind === "database") {
    for (const y of [-12, 0, 12]) {
      c.beginPath();
      c.ellipse(0, y, 16, 5.2, 0, 0, y === -12 ? Math.PI * 2 : Math.PI);
      c.stroke();
    }
    path([
      [-16, -12],
      [-16, 12],
    ]);
    path([
      [16, -12],
      [16, 12],
    ]);
  } else if (kind === "code") {
    c.strokeRect(-19, -16, 38, 26);
    path([
      [0, 10],
      [0, 17],
      [-8, 17],
      [8, 17],
    ]);
    path([
      [-6, -8],
      [-11, -3],
      [-6, 2],
    ]);
    path([
      [6, -8],
      [11, -3],
      [6, 2],
    ]);
    path([
      [2, -9],
      [-2, 3],
    ]);
  } else if (kind === "ai") {
    for (const [x, y, rr] of [
      [-4, 2, 15],
      [12, -12, 7],
      [12, 12, 4],
    ]) {
      c.beginPath();
      c.moveTo(x, y - rr);
      c.quadraticCurveTo(x + rr * 0.2, y - rr * 0.2, x + rr, y);
      c.quadraticCurveTo(x + rr * 0.2, y + rr * 0.2, x, y + rr);
      c.quadraticCurveTo(x - rr * 0.2, y + rr * 0.2, x - rr, y);
      c.quadraticCurveTo(x - rr * 0.2, y - rr * 0.2, x, y - rr);
      c.fill();
    }
  } else if (kind === "cloud") {
    c.beginPath();
    c.arc(-12, 5, 8, Math.PI * 0.5, Math.PI * 1.5);
    c.arc(0, -1, 11, Math.PI * 1.1, Math.PI * 1.95);
    c.arc(12, 5, 7, Math.PI * 1.4, Math.PI * 2.5);
    c.closePath();
    c.stroke();
  } else if (kind === "check") {
    c.beginPath();
    c.arc(0, 0, 17, 0, Math.PI * 2);
    c.stroke();
    path([
      [-8, 0],
      [-2, 6],
      [9, -6],
    ]);
  } else if (kind === "mail") {
    c.strokeRect(-18, -12, 36, 24);
    path([
      [-17, -10],
      [0, 2],
      [17, -10],
    ]);
  } else if (kind === "mobile") {
    c.strokeRect(-10, -18, 20, 36);
    path([
      [-3, 12],
      [3, 12],
    ]);
  } else if (kind === "search") {
    c.beginPath();
    c.arc(-3, -3, 11, 0, Math.PI * 2);
    c.stroke();
    path([
      [5, 5],
      [16, 16],
    ]);
  } else if (kind === "chart") {
    path([
      [-17, -17],
      [-17, 16],
      [18, 16],
    ]);
    for (let i = 0; i < 3; i++) c.fillRect(-10 + i * 9, 6 - i * 8, 5, 7 + i * 8);
  } else if (kind === "bolt") {
    path([
      [4, -19],
      [-12, 2],
      [-1, 2],
      [-4, 19],
      [12, -4],
      [1, -4],
      [4, -19],
    ]);
  } else if (kind === "chat") {
    c.beginPath();
    c.roundRect(-18.4, -15.6, 36.8, 25.2, 6);
    c.stroke();
    path([
      [-9, 10],
      [-12, 18],
      [-1, 10],
    ]);
    for (const x of [-8.4, 0, 8.4]) {
      c.beginPath();
      c.arc(x, -3, 2, 0, Math.PI * 2);
      c.fill();
    }
  } else if (kind === "gear") {
    for (const radius of [5.2, 12]) {
      c.beginPath();
      c.arc(0, 0, radius, 0, Math.PI * 2);
      c.stroke();
    }
    c.lineWidth = 6.12;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      path([
        [Math.cos(a) * 14, Math.sin(a) * 14],
        [Math.cos(a) * 18, Math.sin(a) * 18],
      ]);
    }
  } else if (kind === "video") {
    c.beginPath();
    c.roundRect(-18.4, -12, 25, 24, 3.2);
    c.stroke();
    path([
      [8.4, -3],
      [18.4, -9.6],
      [18.4, 9.6],
      [8.4, 3],
      [8.4, -3],
    ]);
  } else if (kind === "cart") {
    path([
      [-19, -14.4],
      [-13.6, -14.4],
      [-8.4, 7.2],
      [12, 7.2],
      [17.2, -8.4],
      [-11.2, -8.4],
    ]);
    for (const x of [-6, 9.6]) {
      c.beginPath();
      c.arc(x, 14.4, 2.6, 0, Math.PI * 2);
      c.fill();
    }
  } else if (kind === "pen") {
    path([
      [-16.4, 16.4],
      [-14.8, 8.4],
      [9.2, -15.6],
      [15.6, -9.2],
      [-8.4, 14.8],
      [-16.4, 16.4],
    ]);
    path([
      [4.4, -10.8],
      [10.8, -4.4],
    ]);
  }

  c.restore();
}
