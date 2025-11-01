import { Card, Group, Text, Badge } from '@mantine/core';

type Props = {
  nome?: string;
  masp?: string;
  sre?: string;
};

export function CardProfessorResumo({ nome, masp, sre }: Props) {
  return (
    <Card withBorder radius="md" mt="md">
      <Group justify="space-between">
        <div>
          <Text fw={700}>{nome ?? '—'}</Text>
          <Text fz="xs" c="dimmed">
            MASP <strong>{masp ?? '—'}</strong> — SRE <strong>{sre ?? '—'}</strong>
          </Text>
        </div>
      </Group>
    </Card>
  );
}
