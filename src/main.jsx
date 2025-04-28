import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext.jsx';
import { PermissionsProvider } from './context/PermissionsContext.jsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import QueryClient and Provider

const queryClient = new QueryClient(); // Create a client instance

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}> {/* Wrap everything with QueryClientProvider */}
			<BrowserRouter>
				<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
					<UserProvider>
						<PermissionsProvider>
							<App />
						</PermissionsProvider>
					</UserProvider>
				</ThemeProvider>
			</BrowserRouter>
		</QueryClientProvider>
	</React.StrictMode>
);
