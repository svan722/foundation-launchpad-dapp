import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import { Route, Routes } from "react-router-dom";
import CreateLanchpad from "./pages/CreateLaunchpad";
import ViewLaunchpad from "./pages/ViewLaunchpad";
import LaunchpadList from "./pages/LaunchpadList";
import Admin from "./pages/Admin";
import PageNotFound from "./pages/PageNotFound";

function App() {
  return (
    <div className="App">
      <Header />
      <Toaster />
      {/* <Search /> */}
      <Routes>
        <Route path="/" element={<LaunchpadList />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/create" element={<CreateLanchpad />} />
        <Route path="/launchpads" element={<LaunchpadList />} />
        <Route path="/launchpads/:address" element={<ViewLaunchpad />} />

        {/* Add a "not found" route */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
}

export default App;
