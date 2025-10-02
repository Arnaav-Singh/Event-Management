import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AdminLayout = ({ children }) => (
	<div className="min-h-screen bg-mit-white flex flex-col">
		<Navbar />
		<div className="flex flex-1">
			<Sidebar />
			<main className="flex-1 p-8 bg-mit-white">
				{children}
			</main>
		</div>
	</div>
);

export default AdminLayout;
