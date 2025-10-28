import { Modal, TextInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { AreaAtuacao } from '~/lib/repositories/areasAtuacaoRepository';

interface FormAreaAtuacaoProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: AreaAtuacao) => void;
  initialValues?: AreaAtuacao;
  existingData: AreaAtuacao[];
}

export function FormAreaAtuacao({
  opened,
  onClose,
  onSubmit,
  initialValues = { ordem: 0, title: '', description: '', link: '', titleLink: '' },
  existingData,
}: FormAreaAtuacaoProps) {
  const form = useForm<AreaAtuacao>({
    initialValues,
    validate: {
      ordem: (value) => {
        if (value === null || value === undefined) return 'Ordem é obrigatória';
        const isDuplicate = existingData.some((item) => item.ordem === value && item.id !== initialValues.id);
        if (isDuplicate) return 'Ordem já existe';
        return null;
      },
      title: (value) => (!value || value.trim().length < 3 ? 'Título deve ter no mínimo 3 letras' : null),
      description: (value) => (!value || value.trim().length < 3 ? 'Descrição deve ter no mínimo 3 letras' : null),
      titleLink: (value, values) =>
        values.link && (!value || value.trim().length < 3)
          ? 'Título do link é obrigatório quando o link está preenchido'
          : null,
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Área de Atuação">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput label="Ordem" type="number" {...form.getInputProps('ordem')} mb="sm" />
        <TextInput label="Título" {...form.getInputProps('title')} mb="sm" />
        <TextInput label="Descrição" {...form.getInputProps('description')} mb="sm" />
        <TextInput label="Link (opcional)" {...form.getInputProps('link')} mb="sm" />
        <TextInput label="Título do Link (opcional)" {...form.getInputProps('titleLink')} mb="sm" />
        <Button type="submit">Salvar</Button>
      </form>
    </Modal>
  );
}
