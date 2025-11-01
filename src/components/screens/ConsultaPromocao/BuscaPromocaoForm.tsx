import { Button, Input } from '@mantine/core';
import { IMaskInput } from 'react-imask';
import { FaSearchDollar } from 'react-icons/fa';
import classes from './ConsultaPromocao.module.css';

type Props = {
  onBuscar: (masp: string) => void;
  loading?: boolean;
  initialValue?: string;
};

export default function BuscaPromocaoForm({ onBuscar, loading = false, initialValue = '' }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('masp') as HTMLInputElement | null;
    onBuscar(input?.value ?? '');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={classes.controls}>
        <Input
          name="masp"
          defaultValue={initialValue}
          leftSection={<FaSearchDollar size={16} />}
          component={IMaskInput}
          mask="000000000"
          placeholder="Digite o código MASP"
          classNames={{ input: classes.input }}
          size="md"
          radius="xl"
        />
        <Button type="submit" className={classes.control} color="green.9" radius="xl" size="md" loading={loading}>
          Consultar
        </Button>
      </div>
    </form>
  );
}
