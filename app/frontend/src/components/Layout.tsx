import { AppBar, Toolbar, Typography, Container, Box, alpha, useScrollTrigger } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 10 });
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" sx={{ bgcolor: theme => alpha(theme.palette.background.default, 0.9) }}>
    <AppBar
        position="fixed"
        elevation={trigger ? 4 : 0}
        color="transparent"
        sx={theme => ({
          '--tw-bg-opacity': 0.9,
          backdropFilter: 'blur(14px)',
          background: trigger
            ? 'rgb(40 78 76 / var(--tw-bg-opacity))'
            : alpha(theme.palette.background.paper, 0.65),
          transition: 'background-color 140ms ease, backdrop-filter 140ms ease, box-shadow 240ms ease',
            borderBottom: trigger ? '1px solid rgb(40 78 76 / var(--tw-bg-opacity))' : `1px solid ${alpha(theme.palette.divider, 0.05)}`,
            borderRadius: 0,
            margin: 0,
            left: 0,
            right: 0,
          color: trigger ? '#FFFFFF' : theme.palette.text.primary
        })}
      >
        <Toolbar sx={{ display: 'flex', gap: 3, minHeight: 72 }}> 
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
            <Box
              component="img"
              src={trigger ? "/logo2.png" : "/logo1.png"}
              alt="Flex Living"
              sx={{ height: 40, width: 'auto', transition: 'transform .4s, filter .3s', filter: trigger ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.20))', '&:hover': { transform: 'scale(1.04)' } }}
            />
            <Typography variant="h6" fontWeight={600} letterSpacing={0.5} sx={{ color: trigger ? '#FFFFFF' : 'text.primary', transition: 'color 140ms ease' }}>Reviews</Typography>
          </Box>
          <Box flexGrow={1} />
          <Box display="flex" gap={1.5} alignItems="center">
            <NavLinkItem to="/" active={location.pathname === '/'} invert={trigger}>Dashboard</NavLinkItem>
          </Box>
        </Toolbar>
      </AppBar>
    <Container
        maxWidth="xl"
        sx={{
          flexGrow: 1,
      pt: { xs: 11, md: 12 },
      pb: { xs: 4, md: 6 },
          animation: mounted ? 'fadeIn .6s ease forwards' : 'none',
          '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } }
        }}
      >
        {children}
      </Container>
      <Box component="footer" py={4} textAlign="center" color="text.secondary" fontSize={13} sx={{ mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary">© {new Date().getFullYear()} Flex Living · Crafted with care</Typography>
      </Box>
    </Box>
  );
}

function NavLinkItem({ to, children, active, invert }: { to: string; children: React.ReactNode; active?: boolean; invert?: boolean }) {
  return (
    <Box
      component={Link}
      to={to}
      sx={theme => ({
        position: 'relative',
        px: 1.5,
        py: 0.75,
        borderRadius: 2,
        fontSize: 14,
        fontWeight: 500,
        color: invert ? '#FFFFFF' : (active ? theme.palette.primary.main : theme.palette.text.secondary),
        textDecoration: 'none',
        letterSpacing: 0.4,
        transition: 'color .35s, background .35s',
        '&:hover': {
          background: invert ? 'rgba(255,255,255,0.12)' : alpha(theme.palette.primary.main, 0.07),
          color: invert ? '#FFFFFF' : theme.palette.primary.main
        },
        '&:after': {
          content: '""',
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 4,
          height: 2,
          borderRadius: 2,
          background: active ? (invert ? 'linear-gradient(90deg,#FFFFFF,#F5F5F5)' : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`) : 'transparent',
          transition: 'background .4s'
        }
      })}
    >
      {children}
    </Box>
  );
}

