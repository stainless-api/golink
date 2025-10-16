import { InputAdornment, TextField } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProgressButton from "@/components/ProgressButton";
import Snackbar from "@/components/Snackbar";
import { validateGolinkName } from "@/validator";
import { Golink } from "@/gen/golink/v1/golink_pb";
import client from "@/client";
import { ConnectError } from "@bufbuild/connect";

type Props = {
  golink: Golink;
};

export default function RenameForm({ golink }: Props) {
  const navigate = useNavigate();
  const nameRef = useRef<HTMLInputElement>(null);
  const [renaming, setRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRename = useCallback(() => {
    (async () => {
      if (!nameRef.current || !validateGolinkName(nameRef.current.value)) {
        setError("Invalid name");
        return;
      }

      if (nameRef.current.value === golink.name) {
        setError("New name must be different");
        return;
      }

      setRenaming(true);

      try {
        const resp = await client.renameGolink({
          oldName: golink.name,
          newName: nameRef.current.value,
        });
        // Navigate to the new name
        navigate(`/${resp.golink!.name}`);
      } catch (e) {
        const err = ConnectError.from(e);
        console.error(err);
        setError(err.message);
      } finally {
        setRenaming(false);
      }
    })();
  }, [nameRef, golink.name, navigate]);

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
        />
      </Grid>
      <Grid xs={12}>
        <ProgressButton loading={renaming} onClick={onRename}>
          Rename
        </ProgressButton>
      </Grid>
      <Snackbar open={!!error} severity="error" onClose={() => setError(null)}>
        {error || ""}
      </Snackbar>
    </>
  );
}
