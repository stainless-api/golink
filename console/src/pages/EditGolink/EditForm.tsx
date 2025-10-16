import { InputAdornment, TextField } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProgressButton from "@/components/ProgressButton";
import Snackbar from "@/components/Snackbar";
import { validateGolinkName, validateUrl } from "@/validator";
import { Golink } from "@/gen/golink/v1/golink_pb";
import client from "@/client";
import { ConnectError } from "@bufbuild/connect";

type Props = {
  golink: Golink;
};

export default function EditForm({ golink }: Props) {
  const navigate = useNavigate();
  const nameRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Track changes to enable/disable save button
  const [nameChanged, setNameChanged] = useState(false);
  const [urlChanged, setUrlChanged] = useState(false);

  const hasChanges = nameChanged || urlChanged;

  const onSave = useCallback(() => {
    (async () => {
      if (!nameRef.current || !urlRef.current) {
        return;
      }

      const newName = nameRef.current.value;
      const newUrl = urlRef.current.value;

      // Validate inputs
      if (!validateGolinkName(newName)) {
        setError("Invalid name");
        return;
      }
      if (!validateUrl(newUrl)) {
        setError("Invalid URL");
        return;
      }

      setSaving(true);

      try {
        // Determine which API calls to make based on what changed
        if (nameChanged && urlChanged) {
          // Both changed: rename first, then update URL
          await client.renameGolink({
            oldName: golink.name,
            newName: newName,
          });
          await client.updateGolink({
            name: newName,
            url: newUrl,
          });
          navigate(`/${newName}`);
        } else if (nameChanged) {
          // Only name changed: just rename
          await client.renameGolink({
            oldName: golink.name,
            newName: newName,
          });
          navigate(`/${newName}`);
        } else if (urlChanged) {
          // Only URL changed: just update
          await client.updateGolink({
            name: golink.name,
            url: newUrl,
          });
          setSuccess(true);
          setUrlChanged(false);
        }
      } catch (e) {
        const err = ConnectError.from(e);
        console.error(err);
        setError(err.message);
      } finally {
        setSaving(false);
      }
    })();
  }, [nameRef, urlRef, golink.name, nameChanged, urlChanged, navigate]);

  return (
    <>
      <Grid xs={12}>
        <TextField
          label="Golink Name"
          inputRef={nameRef}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">go/</InputAdornment>
            ),
          }}
          defaultValue={golink.name}
          onChange={(e) => setNameChanged(e.target.value !== golink.name)}
        />
      </Grid>
      <Grid xs={12}>
        <TextField
          label="URL"
          inputRef={urlRef}
          fullWidth
          defaultValue={golink.url}
          onChange={(e) => setUrlChanged(e.target.value !== golink.url)}
        />
      </Grid>
      <Grid xs={12}>
        <ProgressButton
          loading={saving}
          onClick={onSave}
          disabled={!hasChanges}
        >
          Save Changes
        </ProgressButton>
      </Grid>
      <Snackbar open={!!error} severity="error" onClose={() => setError(null)}>
        {error || ""}
      </Snackbar>
      <Snackbar
        open={success}
        severity="success"
        onClose={() => setSuccess(false)}
      >
        Successfully updated.
      </Snackbar>
    </>
  );
}
