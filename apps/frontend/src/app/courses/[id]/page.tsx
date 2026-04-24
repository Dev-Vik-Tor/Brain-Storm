'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';

interface CourseDetailPageProps {
  params: { id: string };
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const [tab, setTab] = useState<'overview' | 'reviews'>('overview');
  const [reviewsKey, setReviewsKey] = useState(0);

  // In a real app these would come from an API call
  const courseId = params.id;

  return (
    <main className="max-w-4xl mx-auto p-8">
      <Link href="/courses" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        ← Back to Courses
      </Link>
      <h1 className="text-3xl font-bold mb-2">Course {courseId}</h1>
      <Link href={`/courses/${courseId}/forum`} className="text-blue-600 hover:underline text-sm mb-6 inline-block">
        View Discussion Forum →
      </Link>

      <div className="flex gap-4 border-b mb-6">
        {(['overview', 'reviews'] as const).map((t) => (
          <button
            key={t}
            className={`pb-2 px-1 capitalize text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <p className="text-gray-600">Course content and details would appear here.</p>
          <ReviewForm courseId={courseId} onSuccess={() => { setTab('reviews'); setReviewsKey((k) => k + 1); }} />
        </div>
      )}

      {tab === 'reviews' && (
        <ReviewList key={reviewsKey} courseId={courseId} />
      )}
    </main>
  );
}
