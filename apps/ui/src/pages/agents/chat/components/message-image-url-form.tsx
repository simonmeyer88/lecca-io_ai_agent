import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type Props = {
  setImageData: React.Dispatch<React.SetStateAction<string[]>>;
};
export function MessageImageUrlForm(props: Props) {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <div className="border-none">
      <Card.Header>Image Address</Card.Header>
      <Card.Content>
        <Input
          value={imageUrl}
          autoFocus
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Add url to image"
        />
      </Card.Content>
      <Card.Footer className="flex justify-end space-x-2">
        <Dialog.Close asChild>
          <Button variant={'ghost'}>Cancel</Button>
        </Dialog.Close>
        <Dialog.Close asChild>
          <Button
            onClick={() => {
              props.setImageData((prev) => [...prev, imageUrl]);
            }}
          >
            Save
          </Button>
        </Dialog.Close>
      </Card.Footer>
    </div>
  );
}
