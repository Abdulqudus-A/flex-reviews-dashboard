import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Rating, Skeleton } from '@mui/material';
import { fetchPublicApproved } from '../api/reviews';

interface PublicReviewItem {
  id: string;
  rating: number | null;
  text: string | null;
  submittedAt: string;
  guestName?: string;
  listingName?: string;
}

export default function PublicReviewFeed({ listing, limit = 6 }: { listing: string | undefined; limit?: number }) {
  const [items, setItems] = useState<PublicReviewItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!listing) return;
    setLoading(true);
    fetchPublicApproved({ listing, pageSize: limit })
      .then(d => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [listing, limit]);

  if (!listing) return null;

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>Featured Guest Feedback</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display:'block', mb: 2 }}>Approved reviews feed (public embed simulation)</Typography>
      <Box display="grid" gap={2} sx={{ gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' } }}>
        {loading && Array.from({ length: limit }).map((_,i)=>(
          <Card key={i} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Skeleton width={120} height={24} />
              <Skeleton width="80%" />
              <Skeleton width="60%" />
            </CardContent>
          </Card>
        ))}
        {!loading && items && items.map(r => (
          <Card key={r.id} variant="outlined" sx={{ borderRadius: 3, display:'flex', flexDirection:'column' }}>
            <CardContent sx={{ flexGrow:1 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Rating size="small" value={r.rating || 0} readOnly max={10} />
                <Typography variant="caption" color="text.secondary">{new Date(r.submittedAt).toLocaleDateString()}</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>{r.text || '—'}</Typography>
              <Typography variant="caption" color="text.secondary">{r.guestName || 'Guest'}</Typography>
            </CardContent>
          </Card>
        ))}
        {!loading && items && items.length === 0 && (
          <Typography variant="body2" color="text.secondary">No approved reviews available yet.</Typography>
        )}
      </Box>
    </Box>
  );
}
