import Home from "../Screens/home"

const authProtectedRoutes = [
    { path: "*", headername: '', component: <Home /> },
    { path: "/home", headername: '', component: <Home /> },
]

export { authProtectedRoutes }