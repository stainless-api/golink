import { Helmet } from "react-helmet";
import { Typography, Button, Card, CardContent, Box } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import DownloadIcon from "@mui/icons-material/Download";

export default function Extensions() {
  return (
    <>
      <Helmet>
        <title>Extensions | Golink</title>
      </Helmet>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Browser Extensions
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Install the Golink extension to use go/ links in your browser.
          </Typography>
        </Grid>

        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Chrome Extension
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                For Google Chrome, Microsoft Edge, and other Chromium-based
                browsers.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  href="/extension/chrome/extension.zip"
                  download
                >
                  Download Chrome Extension
                </Button>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Installation Instructions:
                </Typography>
                <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
                  <li>Download the extension file above</li>
                  <li>
                    Open Chrome and go to{" "}
                    <code>chrome://extensions/</code>
                  </li>
                  <li>
                    Enable "Developer mode" (toggle in top right corner)
                  </li>
                  <li>
                    Click "Load unpacked" and select the unzipped extension
                    folder, OR drag and drop the zip file onto the page
                  </li>
                  <li>The extension is now installed!</li>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Firefox Extension
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                For Mozilla Firefox.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  href="/extension/firefox/extension.xpi"
                >
                  Install Firefox Extension
                </Button>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Installation Instructions:
                </Typography>
                <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
                  <li>Click the button above to download and install</li>
                  <li>
                    Firefox will show a prompt asking for permission to install
                  </li>
                  <li>Click "Add" to confirm</li>
                  <li>The extension is now installed!</li>
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Note: Firefox requires typing <code>http://go/</code> once to
                  recognize the hostname before go/ links will work.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                After Installation
              </Typography>
              <Typography variant="body2" paragraph>
                The extension is pre-configured to use{" "}
                <strong>https://go.stainless.com</strong> as the Golink
                instance. You should be able to start using go/ links
                immediately!
              </Typography>
              <Typography variant="body2">
                To verify it's working, try visiting{" "}
                <strong>go/</strong> in your browser's address bar.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
