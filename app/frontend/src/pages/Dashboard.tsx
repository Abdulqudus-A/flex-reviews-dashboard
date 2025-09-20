import { useEffect, useMemo, useState } from "react";
import { Container, Grid, Box, TextField, MenuItem, Button, Typography, CircularProgress, Alert, alpha, Paper, Chip, LinearProgress } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import ReviewCard from "../components/ReviewCard";
import StatsCard from "../components/StatsCard";
import { Review } from "../types";
import { approveReview, fetchReviews, syncHostaway, fetchCategoryAggregates } from "../api/reviews";
import { slugify } from "../utils/slug";
import { Link as RouterLink } from "react-router-dom";

export default function Dashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [aggregations, setAggregations] = useState<{ listing: string; avgRating: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ channel: "", listing: "", ratingMin: "", from: "", to: "", sort: "date_desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [catAgg, setCatAgg] = useState<any[]>([]);
  const [issues, setIssues] = useState<{ word: string; count: number }[]>([]);
  const [syncing, setSyncing] = useState(false);

  async function load(auto = false) {
    setLoading(true);
    setError(null);
    try {
  const data = await fetchReviews({ ...filters, ratingMin: filters.ratingMin, from: filters.from, to: filters.to, page, pageSize });
      setReviews(data.items);
      setAggregations(data.aggregations);
      // category aggregates
      const cat = await fetchCategoryAggregates({ ...filters, ratingMin: filters.ratingMin, from: filters.from, to: filters.to });
      setCatAgg(cat.items || []);
      // issues (fire and forget)
      fetch('/api/reviews/issues').then(r=>r.json()).then(d=>setIssues(d.items||[])).catch(()=>{});
    } catch (e: any) {
      setError(e?.message || "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(true); /* initial */ }, []);
  useEffect(() => { load(); }, [filters.sort, page, pageSize]);

  const chartData = useMemo(() => {
    return reviews
      .slice()
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
      .map(r => ({ name: r.guestName || "Guest", rating: r.rating, date: new Date(r.submittedAt).toLocaleDateString() }));
  }, [reviews]);

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      await approveReview(id, approved);
      setReviews(prev => prev.map(r => (r.id === id ? { ...r, approved } : r)));
    } catch { /* ignore */ }
  };

  const listings = useMemo(() => Array.from(new Set(reviews.map(r => r.listingName).filter(Boolean))) as string[], [reviews]);
  const channels = useMemo(() => Array.from(new Set(reviews.map(r => r.channel).filter(Boolean))) as string[], [reviews]);

  const approvedCount = reviews.filter(r => r.approved).length;
  const pendingCount = reviews.length - approvedCount;
  const avgAll = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : "0";

  async function handleSync() {
    setSyncing(true);
    try {
  const result = await syncHostaway();
  await load();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
      <Box
        sx={theme => ({
          mb: 4,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main,0.08)}, ${alpha(theme.palette.secondary.main,0.08)})`,
          border: `1px solid ${alpha(theme.palette.divider,0.15)}`,
          borderRadius: 4,
          px: { xs: 2.5, md: 4 },
          py: { xs: 2.5, md: 3 },
          boxShadow: '0 4px 18px -6px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(4px)',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            width: 220,
            height: 220,
            top: -80,
            right: -60,
            background: `radial-gradient(circle at center, ${alpha(theme.palette.primary.main,0.25)}, transparent 70%)`,
            filter: 'blur(4px)',
            opacity: 0.5,
            pointerEvents: 'none'
          }
        })}
      >
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ letterSpacing: 0.5 }}>Reviews Dashboard</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>Monitor performance, curate guest feedback, and track sentiment.</Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <Button variant="outlined" onClick={() => { setFilters({ channel: "", listing: "", ratingMin: "", from: "", to: "", sort: 'date_desc' }); setPage(1); load(); }}>Reset</Button>
          <Button variant="contained" onClick={handleSync} disabled={syncing} sx={{ boxShadow: '0 4px 14px rgba(0,0,0,0.12)', ':hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.18)' } }}>{syncing ? "Syncing..." : "Sync Hostaway"}</Button>
        </Box>
      </Box>

      <Box display="flex" gap={2} flexWrap="wrap" mb={3} sx={{
        '& .MuiTextField-root': { minWidth: 160 },
        '& .MuiInputBase-root': { borderRadius: 3 },
      }}>
        <TextField select size="small" label="Channel" value={filters.channel} onChange={e => { setFilters(f => ({ ...f, channel: e.target.value })); }} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          {channels.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Listing" value={filters.listing} onChange={e => { setFilters(f => ({ ...f, listing: e.target.value })); }} sx={{ minWidth: 200 }}>
          <MenuItem value="">All</MenuItem>
          {listings.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
        </TextField>
        <TextField size="small" label="Min Rating" value={filters.ratingMin} onChange={e => setFilters(f => ({ ...f, ratingMin: e.target.value }))} sx={{ width: 130 }} />
        <TextField
          size="small"
          label="From"
          type="datetime-local"
          value={filters.from}
          onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 210 }}
        />
        <TextField
          size="small"
          label="To"
          type="datetime-local"
          value={filters.to}
          onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 210 }}
        />
        <TextField select size="small" label="Sort" value={filters.sort} onChange={e => { setFilters(f => ({ ...f, sort: e.target.value })); setPage(1); }} sx={{ minWidth: 160 }}>
          <MenuItem value="date_desc">Newest</MenuItem>
          <MenuItem value="date_asc">Oldest</MenuItem>
          <MenuItem value="rating_desc">Rating High→Low</MenuItem>
          <MenuItem value="rating_asc">Rating Low→High</MenuItem>
        </TextField>
        <TextField select size="small" label="Page Size" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} sx={{ width: 130 }}>
          {[12,24,48,96].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
        </TextField>
        <Button variant="contained" onClick={() => { setPage(1); load(); }} disabled={loading} sx={{ borderRadius: 3, px: 3 }}>Apply</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={2} mb={4}>
  <Grid item xs={12} sm={6} md={3}><AnimatedCard><StatsCard title="Total Reviews" value={reviews.length} type="reviews" /></AnimatedCard></Grid>
  <Grid item xs={12} sm={6} md={3}><AnimatedCard delay={60}><StatsCard title="Approved Reviews" value={approvedCount} type="approved" /></AnimatedCard></Grid>
  <Grid item xs={12} sm={6} md={3}><AnimatedCard delay={120}><StatsCard title="Pending Reviews" value={pendingCount} type="pending" /></AnimatedCard></Grid>
  <Grid item xs={12} sm={6} md={3}><AnimatedCard delay={180}><StatsCard title="Average Rating" value={Number(avgAll)} type="rating" /></AnimatedCard></Grid>
      </Grid>

      <Paper elevation={0} sx={theme => ({
        mb: 4,
        p: { xs: 2, md: 3 },
        borderRadius: 4,
        background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper,0.9)}, ${alpha(theme.palette.primary.light,0.08)})`,
        border: `1px solid ${alpha(theme.palette.divider,0.15)}`,
        boxShadow: '0 4px 18px -4px rgba(0,0,0,0.08)'
      })}>
        <Box mb={1} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography variant="subtitle1" fontWeight={600}>Rating Trend</Typography>
          <Typography variant="caption" color="text.secondary">Chronological distribution</Typography>
        </Box>
        <Box height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide={chartData.length > 15} />
              <YAxis domain={[0, 'dataMax+1']} />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#1E40AF" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Category Breakdown & Issues */}
      {!loading && !error && (
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={theme=>({ p:2.5, borderRadius:4, border:`1px solid ${alpha(theme.palette.divider,0.15)}` })}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Category Averages</Typography>
              {catAgg.length === 0 && <Typography variant="body2" color="text.secondary">No category data.</Typography>}

              <Grid container spacing={2}>
                {catAgg.slice(0,6).map(block => {
                  const avg = typeof block.avgRating === 'number' ? block.avgRating : 0;
                  const pct = Math.round(Math.max(0, Math.min(5, avg)) / 5 * 100);
                  return (
                    <Grid item xs={12} sm={6} key={block.listing}>
                      <Box sx={{ p: 2, borderRadius: 2, border: theme => `1px solid ${alpha(theme.palette.divider,0.08)}` }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ mr: 1 }}>{block.listing}</Typography>
                          <Typography variant="h6" fontWeight={800}>{avg ? avg.toFixed(1) : '—'}</Typography>
                        </Box>

                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ height: 8, width: '100%', background: theme => alpha(theme.palette.primary.main,0.08), borderRadius: 99, overflow: 'hidden' }}>
                            <Box sx={{ height: '100%', width: `${pct}%`, background: theme => theme.palette.primary.main }} />
                          </Box>
                        </Box>

                        <Box display="flex" flexWrap="wrap" gap={0.6} mt={1}>
                          {Array.isArray(block.categories) && block.categories.sort((a:any,b:any)=>b.avgRating-a.avgRating).slice(0,5).map((c:any) => (
                            <Chip key={c.category} size="small" label={`${c.category}: ${c.avgRating.toFixed(1)}`} sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={theme=>({ p:2.5, height:'100%', borderRadius:4, border:`1px solid ${alpha(theme.palette.divider,0.15)}` })}>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Frequent Keywords</Typography>
              {issues.length === 0 && <Typography variant="body2" color="text.secondary">No data yet.</Typography>}
              <Box display="flex" flexWrap="wrap" gap={0.8}>
                {issues.slice(0,30).map(w => <Chip key={w.word} size="small" label={`${w.word} (${w.count})`} />)}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2}>
          {reviews.map(r => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={r.id}>
              <Box component={RouterLink} to={`/property/${slugify(r.listingName || String(r.sourceId))}`} sx={{ textDecoration: 'none', display: 'block', transition: 'transform .4s cubic-bezier(.4,0,.2,1)', '&:hover': { transform: 'translateY(-4px)' } }}>
                <ReviewCard review={r} onApprove={handleApprove} dense />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
      {!loading && reviews.length > 0 && (
        <Box display="flex" justifyContent="center" gap={2} mt={4}>
          <Button variant="outlined" size="small" disabled={page===1} onClick={()=>{ setPage(p=>p-1); }}>Prev</Button>
          <Typography variant="caption" sx={{ display:'flex', alignItems:'center' }}>Page {page}</Typography>
          <Button variant="outlined" size="small" disabled={reviews.length < pageSize} onClick={()=>{ setPage(p=>p+1); }}>Next</Button>
        </Box>
      )}
    </Container>
  );
}

function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <Box sx={{
      opacity: 0,
      transform: 'translateY(10px)',
      animation: `fadeUp .7s ${delay}ms forwards cubic-bezier(.4,0,.2,1)`,
      '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } }
    }}>
      {children}
    </Box>
  );
}

