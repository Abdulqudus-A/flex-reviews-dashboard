import { useEffect, useMemo, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Container, Typography, Box, Grid, Breadcrumbs, Link, CircularProgress, Paper, Chip, Divider, Button, alpha, Tabs, Tab } from "@mui/material";
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Review } from "../types";
import { fetchReviews, approveReview } from "../api/reviews";
import ReviewCard from "../components/ReviewCard";
import PublicReviewFeed from "../components/PublicReviewFeed";
import { slugify, deslug } from "../utils/slug";

export default function PropertyPage() {
    const { id } = useParams(); // sourceId
    const [all, setAll] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      (async () => {
        setLoading(true);
        try {
          const data = await fetchReviews();
          setAll(data.items);
        } catch (e: any) {
          setError(e?.message || "Failed to load");
        } finally {
          setLoading(false);
        }
      })();
    }, [id]);

    // Resolve listing name: try slug match first, then fallback to sourceId mapping.
    const listingName = useMemo(() => {
      if (!id) return undefined;
      const bySlug = all.find(r => slugify(r.listingName || "") === id);
      if (bySlug) return bySlug.listingName;
      const bySource = all.find(r => String(r.sourceId) === id);
      if (bySource) return bySource.listingName;
      // Best-effort de-slug for display only
      return deslug(id);
    }, [all, id]);

  const propertyReviews: Review[] = useMemo(
      () => all.filter(r => r.listingName === listingName),
      [all, listingName]
    );
    const approvedReviews = useMemo(() => propertyReviews.filter(r => r.approved), [propertyReviews]);

  const avg = propertyReviews.length ? (propertyReviews.reduce((s, r) => s + (r.rating || 0), 0) / propertyReviews.length).toFixed(1) : "0";
  const approved = approvedReviews.length;

    const chartData = propertyReviews
      .slice()
      .sort((a: Review, b: Review) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
      .map((r: Review) => ({ date: new Date(r.submittedAt).toLocaleDateString(), rating: r.rating }));

    const handleApprove = async (rid: string, flag: boolean) => {
      await approveReview(rid, flag);
      setAll(prev => prev.map(r => (r.id === rid ? { ...r, approved: flag } : r)));
    };

  const [tab, setTab] = useState(0);

  return (
      <Box>
        {/* Hero Section */}
        <Box
          sx={theme => ({
            position: 'relative',
            minHeight: { xs: 300, md: 360 },
            display: 'flex',
            alignItems: 'flex-end',
            overflow: 'hidden',
            color: '#fff',
            backgroundColor: '#0A0A0A',
            backgroundImage: `
              linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.65)),
              linear-gradient(90deg,rgba(0,0,0,0.4),rgba(0,0,0,0.25)),
              url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80)
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&:after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15), transparent 60%)`
            }
          })}
        >
          <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 }, pb: 4, position: 'relative', zIndex: 2 }}>
            <Breadcrumbs sx={{ mb: 1, '& a': { color: 'rgba(255,255,255,0.9)' } }}>
              <Link component={RouterLink} underline="hover" color="inherit" to="/">Dashboard</Link>
              <Typography color="inherit">{listingName}</Typography>
            </Breadcrumbs>
            <Typography
              variant="h3"
              fontWeight={600}
              gutterBottom
              sx={{
                textShadow: '0 4px 18px rgba(0,0,0,0.55)',
                fontSize: { xs: '1.95rem', md: '2.6rem' },
                color: '#e9e9e9ff'
              }}
            >
              {listingName}
            </Typography>
            <MetricsBar avg={avg} approved={approved} total={propertyReviews.length} />
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {loading && <Box py={6} display="flex" justifyContent="center"><CircularProgress /></Box>}
          {error && <Typography color="error" mb={4}>{error}</Typography>}

          {!loading && !error && (
            <>
              <Box mb={4}>
                <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile>
                  <Tab label="Overview" />
                  <Tab label="Approved Reviews" />
                  <Tab label="Public Embed" />
                  <Tab label="Analytics" />
                  <Tab label="Manager" />
                </Tabs>
              </Box>

              {tab === 0 && (
                <Grid container spacing={3} mb={6}>
                  <Grid item xs={12} md={7}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>About this property</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Placeholder marketing description approximating Flex Living style. Replace with localized copy, USP highlights, and booking CTAs.
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>Amenities</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                      {['Wi-Fi','Workspace','Kitchen','Washer','Smart TV','Heating','Balcony','Premium Linen'].map(a => <Chip key={a} size="small" label={a} />)}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Rating Trend</Typography>
                      <Box height={200}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" hide />
                            <YAxis domain={[0, 'dataMax+1']} width={30} />
                            <Tooltip />
                            <Line type="monotone" dataKey="rating" stroke="#1E40AF" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {tab === 1 && (
                <Box>
                  <Box mb={3} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Typography variant="h6" fontWeight={600}>Approved Guest Reviews</Typography>
                    <Typography variant="body2" color="text.secondary">Curated for public display</Typography>
                  </Box>
                  {approvedReviews.length === 0 && (
                    <Typography color="text.secondary" mb={4}>No approved reviews yet. Approve reviews from the dashboard to feature them here.</Typography>
                  )}
                  <Grid container spacing={2} mb={6}>
                    {approvedReviews.map(r => (
                      <Grid item xs={12} sm={6} md={4} key={r.id}>
                        <ReviewCard review={r} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {tab === 2 && (
                <PublicReviewFeed listing={listingName} limit={6} />
              )}

              {tab === 3 && (
                <Grid container spacing={3} mb={6}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p:2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>Metrics</Typography>
                      <Typography variant="body2" color="text.secondary">Average rating across {propertyReviews.length} reviews: {avg}</Typography>
                      <Typography variant="body2" color="text.secondary">Approved ratio: {approved}/{propertyReviews.length}</Typography>
                      <Typography variant="caption" color="text.secondary">Trend chart shown in Overview.</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p:2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>Embed Info</Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Public feed endpoint: <code>/api/reviews/public?listing={encodeURIComponent(listingName || '')}</code>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Integrate via client-side fetch or server-side caching layer.</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {tab === 4 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Manager Tools</Typography>
                  <Button size="small" variant="outlined" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top</Button>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    );
  }

// --- Metrics Bar Component ---
function MetricsBar({ avg, approved, total }: { avg: string; approved: number; total: number }) {
  const items = [
    {
      label: 'Avg Rating',
      value: avg,
      icon: <StarRoundedIcon sx={{ fontSize: 22 }} />,
      sx: (theme: any) => ({
        background: 'linear-gradient(135deg,#F5B300,#FFCE47)',
        color: '#0A0A0A'
      })
    },
    {
      label: 'Approved',
      value: approved,
      icon: <CheckCircleRoundedIcon sx={{ fontSize: 22 }} />,
      sx: (theme: any) => ({
        background: 'linear-gradient(135deg,#27AE60,#2FCF74)',
        color: '#fff'
      })
    },
    {
      label: 'Total',
      value: total,
      icon: <FormatListBulletedRoundedIcon sx={{ fontSize: 22 }} />,
      sx: (theme: any) => ({
        background: alpha('#FFFFFF', 0.08),
        border: '1px solid rgba(255,255,255,0.25)',
        backdropFilter: 'blur(6px)',
        color: '#FFFFFF'
      })
    }
  ];

  return (
    <Box display="flex" gap={1.5} flexWrap="wrap" mt={1}>
      {items.map(i => (
        <Paper
          key={i.label}
          elevation={0}
          sx={(theme) => ({
            px: 2.2,
            py: 1.2,
            minWidth: 150,
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            borderRadius: 3,
            boxShadow: '0 4px 18px -4px rgba(0,0,0,0.35)',
            position: 'relative',
            overflow: 'hidden',
            fontWeight: 600,
            ...i.sx(theme),
            '&:before': i.label === 'Avg Rating' ? { content: '""', position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.35), rgba(255,255,255,0))', mixBlendMode: 'overlay' } : undefined,
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px -6px rgba(0,0,0,0.45)' },
            transition: 'transform .45s cubic-bezier(.4,0,.2,1), box-shadow .45s'
          })}
        >
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.15)', color: 'inherit' }}>
            {i.icon}
          </Box>
          <Box>
            <Typography variant="caption" sx={{ letterSpacing: 0.5, opacity: 0.85, fontWeight: 500 }}>{i.label}</Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1, mt: 0.4 }}>{i.value}</Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
