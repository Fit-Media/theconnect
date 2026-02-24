import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { SharedTrip } from './pages/SharedTrip.tsx'

import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
import "mobile-drag-drop/default.css";

polyfill({
  dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});

// Polyfill requires an event listener for touchmove on window with passive: false 
window.addEventListener('touchmove', function() {}, {passive: false});
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/shared/:id",
    element: <SharedTrip />,
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
