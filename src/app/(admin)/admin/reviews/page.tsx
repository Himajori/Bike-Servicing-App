"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StarRating } from "@/components/star-rating";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: { user: { name: string } };
  mechanic: { user: { name: string } };
  booking: { service: { name: string } };
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    api<{ reviews: Review[] }>("/api/admin/reviews")
      .then((d) => setReviews(d.reviews))
      .catch(() => undefined);
  }, []);

  return (
    <main>
      <h1 className="font-heading text-3xl">Reviews</h1>
      <div className="mt-4 space-y-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{review.booking.service.name}</p>
                <StarRating value={review.rating} readOnly />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {review.customer.user.name} → {review.mechanic.user.name}
              </p>
              {review.comment ? <p className="mt-2 text-sm">{review.comment}</p> : null}
            </article>
          ))
        )}
      </div>
    </main>
  );
}
