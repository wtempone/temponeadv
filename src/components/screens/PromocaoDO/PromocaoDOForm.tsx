import { Button, Group, Stack, TextInput, Title } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { PromocaoDO } from '~/lib/repositories/promocoesDORepository';
import { PromocaoDORepository } from '~/lib/repositories/promocoesDORepository';

export function PromocaoDOForm({ onSave }: { onSave?: () => void }) {
  const form = useForm<PromocaoDO>({
    initialValues: {
      sre: '',
      nome: '',
      masp: '',
      numeroAdm: '',
      carreira: '',
      nivelAtual: '',
      grauAtual: '',
      novoNivel: '',
      novoGrau: '',
      vigencia: new Date(),
      publicacao: new Date(),
    },
  });

  async function handleSubmit(values: PromocaoDO) {
    const repo = new PromocaoDORepository();
    await repo.add(values);
    form.reset();
    onSave?.();
  }

  return (
    <Stack>
      <Title order={4}>Nova Promoção</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput label="Nome" {...form.getInputProps('nome')} />
          <TextInput label="MASP" {...form.getInputProps('masp')} />
          <TextInput label="SRE" {...form.getInputProps('sre')} />
          <TextInput label="Número ADM" {...form.getInputProps('numeroAdm')} />
          <TextInput label="Carreira" {...form.getInputProps('carreira')} />
          <Group grow>
            <TextInput label="Nível Atual" {...form.getInputProps('nivelAtual')} />
            <TextInput label="Grau Atual" {...form.getInputProps('grauAtual')} />
          </Group>
          <Group grow>
            <TextInput label="Novo Nível" {...form.getInputProps('novoNivel')} />
            <TextInput label="Novo Grau" {...form.getInputProps('novoGrau')} />
          </Group>
          <Group grow>
            <DateInput label="Vigência" {...form.getInputProps('vigencia')} />
            <DateInput label="Publicação" {...form.getInputProps('publicacao')} />
          </Group>
          <Group justify="flex-end">
            <Button type="submit">Salvar</Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
