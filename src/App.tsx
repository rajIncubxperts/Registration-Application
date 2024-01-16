import { Routes, Route } from "react-router-dom";
import { authProtectedRoutes } from "./routes";

function App() {
  return (
    <>
      <div className="m-2">
        <Routes>
          {authProtectedRoutes.map((route, idx) => (
            <Route path={route.path} element={route.component} key={idx} />
          ))}
        </Routes>
      </div>
    </>
  );
}

export default App;
