import { Card, CardContent, Typography } from "@mui/material";

interface StatsCardProps {
  title: string;
  value: number;
}

function StatsCard({ title, value }: StatsCardProps) {
  return (
    <Card elevation={0} sx={{ borderRadius: 2, p: 0.5 }}>
      <CardContent sx={{ py: 2.5, px: 2.5 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default StatsCard;
