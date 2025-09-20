import { Card, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import StarRateIcon from '@mui/icons-material/StarRate';
import RateReviewIcon from '@mui/icons-material/RateReview';

interface StatsCardProps {
  title: string;
  value: string | number;
  /** Optional trend text shown under the value, e.g. '+12% from last month' */
  trend?: string;
  /** Optional numeric trend value to determine color (positive => green, negative => red) */
  trendValue?: number;
  /** Optional icon to render on the right. If provided, it overrides `type`. */
  icon?: React.ReactNode;
  /** Pre-defined visual type: 'reviews'|'approved'|'pending'|'rating' (affects icon & accent) */
  type?: 'reviews' | 'approved' | 'pending' | 'rating';
}

function StatsCard({ title, value, trend, trendValue, icon, type = 'reviews' }: StatsCardProps) {
  const theme = useTheme();

  const isPositive = typeof trendValue === 'number' ? trendValue > 0 : (typeof trend === 'string' ? trend.trim().startsWith('+') : false);

  const getIconForType = () => {
    if (icon) return icon;
    switch (type) {
      case 'approved':
        return <CheckCircleOutlineIcon sx={{ color: theme.palette.success.main, fontSize: 26 }} />;
      case 'pending':
        return <HourglassBottomIcon sx={{ color: 'rgba(245,179,0,0.95)', fontSize: 26 }} />;
      case 'rating':
        return <StarRateIcon sx={{ color: theme.palette.secondary.main, fontSize: 26 }} />;
      default:
        return <RateReviewIcon sx={{ color: 'rgb(40 78 76 / var(--tw-bg-opacity))', fontSize: 26 }} />;
    }
  };

  const bgForType = () => {
    switch (type) {
      case 'approved':
        return 'rgba(39,174,96,0.10)';
      case 'pending':
        return 'rgba(245,179,0,0.10)';
      case 'rating':
        return 'rgba(245,179,0,0.06)';
      default:
        return '#F4F6F8';
    }
  };

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: '12px',
        background: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(3,11,10,0.06)',
        p: 3,
        minHeight: 150,
        fontFamily: theme.typography.fontFamily,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: 13 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.05, fontSize: 32 }}>
              {type === 'rating' && typeof value === 'number' ? value.toFixed(1) : value}
            </Typography>
          </Box>

          {trend ? (
            <Typography
              variant="body2"
              sx={{
                color: isPositive ? theme.palette.success.main : theme.palette.error?.main || '#D32F2F',
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              {trend}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: bgForType(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getIconForType()}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

export default StatsCard;
