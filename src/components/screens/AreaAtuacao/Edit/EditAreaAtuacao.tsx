import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import { TextInput, Text, Paper, Group, Button, Stack, Container, NumberInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import {
  AddAreaAtuacao,
  AreaAtuacao,
  GetAreaAtuacao,
  UpdateAreaAtuacao,
} from '~/lib/repositories/areasAtuacaoRepository';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditAreaAtuacao() {
  interface FormData {
    id: string;
    ordem: number;
    title: string;
    description: string;
  }
  const { paramId } = useParams();

  const navigate = useNavigate();

  const [loadForm, setLoadForm] = useState(true);

  const form = useForm<FormData>({
    initialValues: {
      id: '',
      ordem: 1,
      title: '',
      description: '',
    },

    validate: {
      ordem: (val) => (val <= 0 ? 'A ordem deve ter um valor' : null),
      title: (val) => (val.length <= 6 ? 'Título deve ter pelo menos 6 caracteres' : null),
      description: (val) => (val.length <= 6 ? 'Descricção deve ter pelo menos 6 caracteres' : null),
    },
  });

  useEffect(() => {
    if (loadForm) {
      setFields();
      setLoadForm(false);
    }
  }, []);

  const setFields = () => {
    if (paramId !== undefined) {
      GetAreaAtuacao(paramId).then((area: AreaAtuacao | undefined) => {
        if (area) {
          form.setFieldValue('ordem', area.ordem!);
          form.setFieldValue('title', area.title);
          form.setFieldValue('description', area.description);
        }
      });
    }
  };

  const [opened, { open, close }] = useDisclosure(false);

  const handleSubmit = async (formData: FormData) => {
    if (form.errors.title || form.errors.description || form.errors.ordem) {
      notifications.show({
        title: 'Erro',
        message: 'Por favor, corrija os erros no formulário antes de salvar.',
        color: 'red',
      });
      return;
    }
    debugger;
    const area: AreaAtuacao = {
      ordem: formData.ordem,
      title: formData.title,
      description: formData.description,
    };
    if (paramId !== undefined) {
      UpdateAreaAtuacao(paramId, area).then(() => {
        notifications.show({
          title: 'Sucesso',
          message: 'Área de atuação atualizada com sucesso!',
          color: 'green',
        });
        navigate(-1);
      });
    } else {
      AddAreaAtuacao(area).then(() => {
        notifications.show({
          title: 'Sucesso',
          message: 'Área de criada com sucesso!',
          color: 'green',
        });
        navigate(-1);
      });
    }
  };

  return (
    <>
      <Container>
        <Paper radius="md" p={{ base: 'sm', sm: 'xl' }} withBorder>
          <Text size="lg" fw={500} pb={30}>
            Área de Atuação
          </Text>
          <form
            onSubmit={form.onSubmit((area) => {
              handleSubmit(area as FormData);
            })}
          >
            <Stack>
              <NumberInput
                required
                label="Ordem"
                placeholder="Ordem da área de atuação"
                value={form.values.ordem}
                error={form.errors.ordem && 'Ordem inválida'}
                radius="md"
              />
              <TextInput
                required
                label="Título"
                placeholder="Título da área de atuação"
                value={form.values.title}
                error={form.errors.title && 'Título inválido'}
                radius="md"
                onChange={(event) => form.setFieldValue('title', event.currentTarget.value)}
              />

              <TextInput
                required
                label="Descrição"
                placeholder="Descrição da área de atuação"
                value={form.values.description}
                error={form.errors.description && 'Descrição inválida'}
                radius="md"
                onChange={(event) => form.setFieldValue('description', event.currentTarget.value)}
              />
            </Stack>

            <Group justify="space-between" mt="xl">
              <Button
                variant="danger"
                radius="xl"
                onClick={() => {
                  navigate(-1);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" radius="xl">
                Salvar
              </Button>
            </Group>
          </form>
        </Paper>
      </Container>
    </>
  );
}
