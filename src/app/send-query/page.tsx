import type { Metadata } from 'next';
import QueriesPage from './QueriesPage';

export const metadata: Metadata = {
  title: 'Queries | Admin Dashboard',
  description: 'Manage and track user queries.',
};

export default function Page(): React.JSX.Element {
  return <QueriesPage />;
}
