import type { Metadata } from 'next';
import { MyListings } from '@/components/cabinet/my-listings';

export const metadata: Metadata = {
  title: 'Мої оголошення — АЛЬКОР',
};

export default function MyListingsPage() {
  return <MyListings />;
}
