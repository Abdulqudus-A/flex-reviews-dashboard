import { Card, CardContent, Typography, Chip, Box, Button, Tooltip, Fade } from "@mui/material";
import { Review } from "../types";

interface ReviewCardProps {
  review: Review;
  onApprove?: (id: string, approved: boolean) => void;
  dense?: boolean;
}

export default function ReviewCard({ review, onApprove, dense }: ReviewCardProps) {
  const {
    listingName,
    rating,
    text,
    guestName,
    categories,
    channel,
    approved,
    submittedAt,
    id
  } = review;

  const ratingColor = (r: number | null) => {
    if (r == null) return "default" as const;
    if (r >= 9) return "success" as const;
    if (r >= 7) return "warning" as const;
    return "error" as const;
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backdropFilter: "blur(2px)",
        transition: 'box-shadow .35s, transform .35s',
        '&:hover': { boxShadow: '0 6px 18px -4px rgba(0,0,0,0.18)', transform: 'translateY(-2px)' }
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1, pt: 2, px: 2.25 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
          <Typography variant="subtitle1" fontWeight={600} noWrap title={listingName}>
            {listingName || "—"}
          </Typography>
          <Chip
            size="small"
            label={rating == null ? "—" : rating}
            color={ratingColor(rating)}
            variant="outlined"
          />
        </Box>
        <Box display="flex" alignItems="center" gap={0.75} mb={1} flexWrap="wrap">
          {channel && <Chip size="small" label={channel} variant="outlined" />}
          <Chip size="small" label={new Date(submittedAt).toLocaleDateString()} />
          {approved && <Chip size="small" color="success" label="Approved" />}
        </Box>
        {text && (
          <Tooltip TransitionComponent={Fade} title={text} enterDelay={600} arrow>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                display: "-webkit-box",
                WebkitLineClamp: dense ? 2 : 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontStyle: "italic"
              }}
            >
              “{text}”
            </Typography>
          </Tooltip>
        )}
        <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
          {categories.slice(0, dense ? 2 : 4).map(c => (
            <Chip key={c.category} size="small" label={`${c.category}: ${c.rating}`} />
          ))}
          {categories.length > (dense ? 2 : 4) && (
            <Chip size="small" label={`+${categories.length - (dense ? 2 : 4)}`} />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          – {guestName || "Guest"}
        </Typography>
      </CardContent>
      {onApprove && (
        <Box px={2} pb={1} display="flex" justifyContent="flex-end">
          <Button
            size="small"
            variant={approved ? "outlined" : "contained"}
            color={approved ? "primary" : "primary"}
            onClick={() => onApprove(id, !approved)}
            sx={{
              textTransform: "none",
              ...(approved ? { borderColor: 'rgba(40,78,76,0.9)', color: 'rgba(40,78,76,0.95)' } : {}),
            }}
          >
            {approved ? "Unapprove" : "Approve"}
          </Button>
        </Box>
      )}
    </Card>
  );
}

